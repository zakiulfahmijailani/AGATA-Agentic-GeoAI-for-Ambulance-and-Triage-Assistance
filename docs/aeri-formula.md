# AGATA Emergency Readiness Index (AERI)

## Purpose

The AGATA Emergency Readiness Index (AERI) is a deterministic 0-100 operational readiness score for Jakarta hospitals and zones. Higher scores mean better emergency readiness based on current capacity, ER status, trauma capability, and optionally patient-to-hospital distance when `distance_km` is present.

AERI is intended as a first-pass dispatch support signal. It is not a clinical diagnosis, patient outcome prediction, or replacement for dispatcher judgment.

## Why AERI Uses Current AGATA Data Only

This MVP uses only fields already present in the AGATA `Hospital` model:

- `capacity`
- `available_beds`
- `er_status`
- `trauma_level`
- `distance_km` when returned by an existing hospital query
- `zone`

This keeps the index auditable and avoids introducing new backend APIs, external medical data, real patient data, routing services, or speculative real-time feeds that are outside the current TRL 3 scope.

## Component Scores

All component scores are clamped to the range 0-100 where applicable.

### 1. Capacity Score (CS)

Measures remaining usable bed capacity.

```text
rawRatio = available_beds / capacity
CS = clamp(rawRatio * 100, 0, 100)
```

Rules:

- If `capacity <= 0`, return `0`.
- If `available_beds < 0`, treat it as `0`.
- If `available_beds > capacity`, clamp the final score to `100`.

### 2. ER Status Score (ERS)

The ER status mapping is intentionally nonlinear.

| `er_status` | ERS |
|---|---:|
| `AVAILABLE` | 100 |
| `BUSY` | 45 |
| `FULL` | 0 |

### 3. Trauma Score (TS)

Base trauma capability:

| `trauma_level` | Base score |
|---:|---:|
| 1 | 100 |
| 2 | 70 |
| 3 | 40 |

ER operational factor:

| `er_status` | Factor |
|---|---:|
| `AVAILABLE` | 1.0 |
| `BUSY` | 0.7 |
| `FULL` | 0.0 |

```text
TS = traumaBase * erFactor
```

Examples:

| Trauma level | ER status | TS |
|---:|---|---:|
| 1 | `AVAILABLE` | 100 |
| 1 | `BUSY` | 70 |
| 1 | `FULL` | 0 |
| 2 | `AVAILABLE` | 70 |
| 3 | `BUSY` | 28 |

If `trauma_level` is invalid at runtime, the implementation falls back to the lowest trauma bucket.

### 4. Accessibility Score (AS)

Accessibility applies only when `distance_km` is available.

| Distance | AS |
|---|---:|
| `distance_km <= 5` | 100 |
| `5 < distance_km <= 10` | 80 |
| `10 < distance_km <= 20` | 60 |
| `20 < distance_km <= 30` | 35 |
| `distance_km > 30` | 15 |

Rules:

- If `distance_km` is `undefined`, `null`, or `NaN`, return `null`.
- If `distance_km < 0`, treat it as `0`.
- Do not use exponential decay in this MVP.

## Hospital Scores

### Base hospital readiness score

Used when accessibility is unavailable.

```text
HRS_base = 0.40 * CS + 0.35 * ERS + 0.25 * TS
```

### Full hospital readiness score

Used only when AS is available.

```text
HRS_full = 0.35 * CS + 0.30 * ERS + 0.20 * TS + 0.15 * AS
```

Final hospital score:

- If `AS` is available, use `HRS_full`.
- If `AS` is unavailable, use `HRS_base`.
- Do not treat missing AS as `0`.
- Clamp the final hospital score to 0-100.

## ZoneAERI

ZoneAERI is a detailed zone-level score using capacity-weighted hospital readiness, a coverage penalty, and a trauma coverage modifier.

### 1. Zone base score

For all hospitals in the zone:

```text
capacityWeight = max(capacity, 0)

ZoneBase =
  sum(hospitalScore * capacityWeight) / sum(capacityWeight)
```

If total capacity weight is `0`, use the simple average of hospital scores. If there are no hospitals in the zone, `baseScore` and `finalScore` are `null`.

### 2. Coverage penalty

| Hospital count in zone | Coverage penalty |
|---:|---:|
| 3 or more | 1.00 |
| 2 | 0.90 |
| 1 | 0.75 |
| 0 | 0.00 |

### 3. Trauma coverage modifier

| Zone condition | Modifier |
|---|---:|
| At least one trauma level 1 hospital with `er_status != FULL` | 1.00 |
| Else at least one trauma level 2 hospital with `er_status != FULL` | 0.85 |
| Else at least one trauma level 3 hospital with `er_status != FULL` | 0.70 |
| Else | 0.50 |

### 4. Final ZoneAERI

```text
ZoneAERI = clamp(ZoneBase * CoveragePenalty * TraumaCoverageModifier, 0, 100)
```

## AERI_MVP Zone Formula

This is a simpler zone-only MVP score.

### 1. BedAvailability_z

```text
BedAvailability_z =
  clamp((sum available_beds / sum capacity) * 100, 0, 100)
```

### 2. ERPressure_z

Let:

- `A` = count of `AVAILABLE` hospitals
- `B` = count of `BUSY` hospitals
- `F` = count of `FULL` hospitals
- `N` = total hospitals in zone

If `N = 0`, return `null`.

```text
ERPressure_z =
  100 * ((1.0 * A) + (0.45 * B) + (0.0 * F)) / N
```

### 3. TraumaReadiness_z

Use the capacity-weighted average trauma score `TS` across the zone.

### 4. Final AERI_MVP

```text
AERI_MVP =
  0.45 * BedAvailability_z
  + 0.35 * ERPressure_z
  + 0.20 * TraumaReadiness_z
```

Clamp the final MVP score to 0-100.

## Readiness Categories

| Score range | Category |
|---|---|
| 80 to 100 | High Readiness |
| 60 to <80 | Stable |
| 40 to <60 | Strained |
| 20 to <40 | Critical |
| 0 to <20 | Overloaded |

## Worked Example

This example is mirrored in `src/lib/aeri.demo.ts`.

### Demo hospitals

| Hospital | Zone | Capacity | Available beds | ER status | Trauma level | Distance km |
|---|---|---:|---:|---|---:|---:|
| AGATA Demo Central Trauma Center | Pusat | 100 | 80 | `AVAILABLE` | 1 | 4 |
| AGATA Demo Busy Regional Hospital | Pusat | 60 | 18 | `BUSY` | 2 | 12 |
| AGATA Demo Full Community Hospital | Selatan | 40 | 0 | `FULL` | 3 | unavailable |

### Hospital results

| Hospital | CS | ERS | TS | AS | Base score | Full score | Score used | Category |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| AGATA Demo Central Trauma Center | 80 | 100 | 100 | 100 | 92 | 93 | 93 | High Readiness |
| AGATA Demo Busy Regional Hospital | 30 | 45 | 49 | 60 | 40 | 42.8 | 42.8 | Strained |
| AGATA Demo Full Community Hospital | 0 | 0 | 0 | null | 0 | null | 0 | Overloaded |

### Detailed zone results

For Pusat:

```text
ZoneBase = ((93 * 100) + (42.8 * 60)) / 160
ZoneBase = 74.175
CoveragePenalty = 0.90
TraumaCoverageModifier = 1.00
ZoneAERI = 74.175 * 0.90 * 1.00 = 66.7575
Category = Stable
```

For Selatan:

```text
ZoneBase = (0 * 40) / 40 = 0
CoveragePenalty = 0.75
TraumaCoverageModifier = 0.50
ZoneAERI = 0
Category = Overloaded
```

For an empty zone such as Timur:

```text
baseScore = null
finalScore = null
coveragePenalty = 0.00
category = null
```

### MVP zone results

For Pusat:

```text
BedAvailability_z = (98 / 160) * 100 = 61.25
ERPressure_z = 100 * ((1.0 * 1) + (0.45 * 1) + (0.0 * 0)) / 2 = 72.5
TraumaReadiness_z = ((100 * 100) + (49 * 60)) / 160 = 80.875
AERI_MVP = (0.45 * 61.25) + (0.35 * 72.5) + (0.20 * 80.875)
AERI_MVP = 69.1125
Category = Stable
```

For Selatan:

```text
BedAvailability_z = 0
ERPressure_z = 0
TraumaReadiness_z = 0
AERI_MVP = 0
Category = Overloaded
```

## Assumptions

- `capacity` and `available_beds` are operational estimates in the current MVP dataset.
- `er_status = FULL` should heavily penalize trauma readiness because an unavailable ER cannot absorb emergency demand.
- Distance is optional and only influences hospital scoring when `distance_km` exists on the hospital object.
- Zone scores use hospital scores as currently computable from the available data. If distance is unavailable for a hospital, its base hospital score is used.
- For safety, zone capacity weights use `max(capacity, 0)`.

## Limitations

- AERI does not include travel time, road routing, traffic, ambulance fleet availability, staff availability, ICU capacity, specialty services, or real patient acuity.
- `available_beds`, `capacity`, and `er_status` are MVP operational fields and may be estimates rather than real-time feeds.
- Trauma level is a coarse capability proxy.
- AERI is explainable by design, but it is not clinically validated.
- Zone scores can hide within-zone geography because they aggregate hospitals by administrative zone.

## Future Extensions

- Replace estimated capacity and ER status with verified real-time health system feeds when available.
- Add road-network travel time after routing data is in scope.
- Add ambulance fleet availability when Cardiff/DKI validation data is available.
- Add specialty-specific readiness scores without changing the base AERI formula.
- Validate score behavior against historical dispatch and outcome data in a later TRL phase.
