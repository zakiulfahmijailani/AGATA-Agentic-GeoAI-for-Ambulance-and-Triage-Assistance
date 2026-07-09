'use client';

import dynamic from 'next/dynamic';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Clock3,
  Cross,
  FileText,
  HelpCircle,
  HospitalIcon,
  Layers,
  MapPin,
  MapPinned,
  Pin,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldAlert,
  Stethoscope,
  TrafficCone,
  Wifi,
} from 'lucide-react';
import { AERIBadge } from '@/components/AERIBadge';
import { matchScenario } from '@/lib/mock/chatResponses';
import { mockAgentSteps } from '@/lib/mock/agentSteps';
import { ER_STATUS_LABEL, Hospital, HospitalFilters, ZONE_LABEL } from '@/types';

const MapView = dynamic(() => import('@/components/webgis/MapView'), {
  ssr: false,
  loading: () => (
    <section className="flex h-full flex-1 items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading Jakarta map...</p>
      </div>
    </section>
  ),
});

type Severity = 'Low' | 'Moderate' | 'Urgent' | 'Critical';
type Specialty = 'Trauma' | 'Cardiac' | 'Stroke' | 'Pediatric' | 'Obstetric';
type CaseState = 'empty' | 'loading' | 'success' | 'warning' | 'no-match' | 'error' | 'stale';

interface ActiveCase {
  location: string;
  complaint: string;
  severity: Severity;
  specialty: Specialty;
  notes: string;
  inputTime: Date;
  dispatcher: string;
}

interface RecommendationCandidate {
  hospitalId: number;
  rank: number;
  name: string;
  district: string;
  score: number;
  etaMinutes: number;
  availableBeds: number;
  capacity: number;
  specialistStatus: 'Ready' | 'Limited' | 'Unavailable';
  hospitalLevel: string;
  statusBadge: string;
  miniReason: string;
  reasons: string[];
  warnings: string[];
  erStatus: string;
}

interface PresetCase {
  label: string;
  location: string;
  complaint: string;
  severity: Severity;
  specialty: Specialty;
  notes: string;
}

const DEFAULT_FILTERS: HospitalFilters = {
  zone: 'All',
  traumaLevel: 'All',
  erStatus: 'All',
};

const SPECIALTIES: Specialty[] = ['Trauma', 'Cardiac', 'Stroke', 'Pediatric', 'Obstetric'];
const SEVERITIES: Severity[] = ['Low', 'Moderate', 'Urgent', 'Critical'];
const DEFAULT_PATIENT_LOCATION: [number, number] = [106.8456, -6.2088];

const PRESET_CASES: PresetCase[] = [
  {
    label: 'Cempaka Putih cardiac',
    location: 'Cempaka Putih, Jakarta Pusat',
    complaint: 'Chest pain, shortness of breath',
    severity: 'Critical',
    specialty: 'Cardiac',
    notes: 'Caller reports unstable breathing and possible cardiac event.',
  },
  {
    label: 'Kebayoran trauma',
    location: 'Kebayoran Baru, Jakarta Selatan',
    complaint: 'Motorcycle collision, suspected head injury',
    severity: 'Urgent',
    specialty: 'Trauma',
    notes: 'Police unit is on scene. Patient conscious but confused.',
  },
  {
    label: 'Kelapa Gading pediatric',
    location: 'Kelapa Gading, Jakarta Utara',
    complaint: 'Child with high fever and seizure',
    severity: 'Urgent',
    specialty: 'Pediatric',
    notes: 'Family requests nearest facility with pediatric emergency support.',
  },
];

const FALLBACK_RECOMMENDATIONS: RecommendationCandidate[] = [
  {
    hospitalId: 9001,
    rank: 1,
    name: 'RS Islam Jakarta Pusat',
    district: 'Central Jakarta',
    score: 0.87,
    etaMinutes: 9,
    availableBeds: 8,
    capacity: 40,
    specialistStatus: 'Ready',
    hospitalLevel: 'Level 2 / RSUD-equivalent',
    statusBadge: 'Best overall',
    miniReason: 'Fastest with specialist coverage',
    reasons: [
      'Fastest access among hospitals with available emergency beds.',
      'Specialist coverage matches the requested case profile.',
      'Higher readiness score than nearer low-capacity alternatives.',
    ],
    warnings: [],
    erStatus: 'Available',
  },
  {
    hospitalId: 9002,
    rank: 2,
    name: 'RSCM',
    district: 'Central Jakarta',
    score: 0.82,
    etaMinutes: 13,
    availableBeds: 12,
    capacity: 60,
    specialistStatus: 'Ready',
    hospitalLevel: 'Level 1 / National referral',
    statusBadge: 'High capability',
    miniReason: 'Stronger capability, slightly farther',
    reasons: ['National referral capability.', 'Specialist team available.'],
    warnings: ['Travel time is higher than the top option.'],
    erStatus: 'Available',
  },
  {
    hospitalId: 9003,
    rank: 3,
    name: 'RSUD Pasar Rebo',
    district: 'East Jakarta',
    score: 0.74,
    etaMinutes: 18,
    availableBeds: 10,
    capacity: 45,
    specialistStatus: 'Limited',
    hospitalLevel: 'Level 2 / RSUD',
    statusBadge: 'Backup option',
    miniReason: 'More beds, weaker specialty match',
    reasons: ['Acceptable bed availability.', 'Useful backup if central options are saturated.'],
    warnings: ['Specialist fit is limited for this complaint.'],
    erStatus: 'Busy',
  },
];

interface NearestHospitalsApiResponse {
  hospitals?: Hospital[];
  data?: Hospital[];
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatInputTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function getHospitalLevel(hospital: Hospital): string {
  if (hospital.trauma_level === 1) return 'Level 1 / National referral';
  if (hospital.trauma_level === 2) return 'Level 2 / RSUD';
  return 'Level 3 / Private network';
}

function getSpecialistStatus(index: number, specialty: Specialty): RecommendationCandidate['specialistStatus'] {
  if (index === 0) return 'Ready';
  if (specialty === 'Pediatric' || specialty === 'Obstetric') return index <= 2 ? 'Limited' : 'Unavailable';
  return index <= 2 ? 'Ready' : 'Limited';
}

function buildRecommendationCandidates(
  hospitals: Hospital[],
  specialty: Specialty,
  severity: Severity,
): RecommendationCandidate[] {
  return hospitals.slice(0, 5).map((hospital, index) => {
    const bedRatio = hospital.capacity > 0 ? hospital.available_beds / hospital.capacity : 0;
    const etaMinutes = Math.max(6, Math.round((hospital.distance_km ?? 4 + index * 2) * 2.4 + index * 3));
    const specialistStatus = getSpecialistStatus(index, specialty);
    const score = Math.max(
      0.52,
      0.92 - index * 0.055 - etaMinutes * 0.006 + bedRatio * 0.08 - (specialistStatus === 'Limited' ? 0.06 : 0),
    );
    const warnings = [
      ...(hospital.available_beds <= 3 ? ['Capacity risk: very limited beds available.'] : []),
      ...(specialistStatus === 'Limited' ? [`${specialty} support is limited; confirm before dispatch.`] : []),
      ...(severity === 'Critical' && hospital.trauma_level > 2
        ? ['Critical case with lower destination capability.']
        : []),
    ];

    return {
      hospitalId: hospital.id,
      rank: index + 1,
      name: hospital.name,
      district: `${ZONE_LABEL[hospital.zone]} Jakarta`,
      score: Number(score.toFixed(2)),
      etaMinutes,
      availableBeds: hospital.available_beds,
      capacity: hospital.capacity,
      specialistStatus,
      hospitalLevel: getHospitalLevel(hospital),
      statusBadge: index === 0 ? 'Best overall' : index === 1 ? 'High capability' : 'Backup option',
      miniReason:
        index === 0
          ? 'Best balance of ETA, beds, specialist match'
          : etaMinutes <= 12
            ? 'Fast access, monitor bed capacity'
            : 'Farther, but useful as backup capacity',
      reasons: [
        `${etaMinutes} minute estimated travel time from the active case location.`,
        `${hospital.available_beds}/${hospital.capacity} emergency beds currently available.`,
        specialistStatus === 'Ready'
          ? `${specialty} specialist coverage is ready.`
          : `${specialty} specialist coverage needs confirmation.`,
        `${getHospitalLevel(hospital)} matches the required capability profile.`,
      ],
      warnings,
      erStatus: ER_STATUS_LABEL[hospital.er_status],
    };
  });
}

async function fetchNearestHospitals(patientLocation: [number, number]): Promise<Hospital[]> {
  const [lng, lat] = patientLocation;
  const response = await fetch(`/api/hospitals/nearest?lat=${lat}&lng=${lng}&limit=5`);

  if (!response.ok) return [];

  const data = (await response.json()) as NearestHospitalsApiResponse;
  return data.hospitals ?? data.data ?? [];
}

export default function FullscreenDashboardPage() {
  const [clock, setClock] = useState('--:--:--');
  const [filters, setFilters] = useState<HospitalFilters>(DEFAULT_FILTERS);
  const [visibleHospitals, setVisibleHospitals] = useState<Hospital[]>([]);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [caseState, setCaseState] = useState<CaseState>('empty');
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [activeCase, setActiveCase] = useState<ActiveCase | null>(null);
  const [locationInput, setLocationInput] = useState('Cempaka Putih, Jakarta Pusat');
  const [chiefComplaint, setChiefComplaint] = useState('Chest pain and shortness of breath');
  const [severity, setSeverity] = useState<Severity>('Critical');
  const [specialty, setSpecialty] = useState<Specialty>('Cardiac');
  const [notes, setNotes] = useState('Caller reports unstable breathing. Family is waiting roadside.');
  const [recommendations, setRecommendations] = useState<RecommendationCandidate[]>([]);
  const timersRef = useRef<number[]>([]);

  const isRunning = caseState === 'loading';
  const topRecommendation = recommendations[0] ?? null;
  const alerts = useMemo(() => {
    if (caseState === 'empty') return ['No active incident. Enter case details to generate a recommendation.'];
    if (caseState === 'loading') return ['AGATA is evaluating travel time, beds, specialists, and hospital level.'];
    if (caseState === 'error') return ['Unable to retrieve recommendation data. Use manual override and retry.'];
    if (caseState === 'no-match') return ['No ideal destination found. Review backup hospitals and supervisor override.'];
    if (caseState === 'stale') return ['Bed availability data is stale. Confirm capacity by radio before dispatch.'];
    return recommendations.flatMap((candidate) => candidate.warnings).slice(0, 3);
  }, [caseState, recommendations]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    setClock(formatClock(new Date()));
    const interval = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleHospitalSelect = useCallback((hospital: Hospital) => {
    setSelectedHospitalId(hospital.id);
  }, []);

  const handleFiltersChange = useCallback((nextFilters: HospitalFilters) => {
    setFilters(nextFilters);
    setRecommendedIds([]);
    setRecommendedHospitals([]);
    setSelectedHospitalId(null);
  }, []);

  const handlePreset = useCallback((preset: PresetCase) => {
    setLocationInput(preset.location);
    setChiefComplaint(preset.complaint);
    setSeverity(preset.severity);
    setSpecialty(preset.specialty);
    setNotes(preset.notes);
  }, []);

  const handleReset = useCallback(() => {
    clearTimers();
    setPatientLocation(null);
    setRecommendedIds([]);
    setRecommendedHospitals([]);
    setSelectedHospitalId(null);
    setRecommendations([]);
    setActiveCase(null);
    setCaseState('empty');
    setCurrentStepId(null);
    setIsDone(false);
  }, [clearTimers]);

  const handleGenerate = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!locationInput.trim() || !chiefComplaint.trim()) {
        setCaseState('error');
        return;
      }

      clearTimers();
      setCaseState('loading');
      setCurrentStepId(null);
      setIsDone(false);
      setRecommendations([]);
      setRecommendedIds([]);
      setRecommendedHospitals([]);

      mockAgentSteps.forEach((step, index) => {
        const timer = window.setTimeout(() => setCurrentStepId(step.id), index * 550);
        timersRef.current.push(timer);
      });

      const active: ActiveCase = {
        location: locationInput.trim(),
        complaint: chiefComplaint.trim(),
        severity,
        specialty,
        notes: notes.trim(),
        inputTime: new Date(),
        dispatcher: 'Dispatcher Unit PK3D-01',
      };
      setActiveCase(active);

      const finishTimer = window.setTimeout(async () => {
        try {
          const matchedScenario = matchScenario(locationInput);
          const nextPatientLocation = matchedScenario?.patientLocation ?? DEFAULT_PATIENT_LOCATION;
          const nearestHospitals = matchedScenario ? await fetchNearestHospitals(nextPatientLocation) : [];
          const sourceHospitals = nearestHospitals.length ? nearestHospitals : visibleHospitals.slice(0, 5);
          const nextRecommendations = sourceHospitals.length
            ? buildRecommendationCandidates(sourceHospitals, specialty, severity)
            : FALLBACK_RECOMMENDATIONS;

          setPatientLocation(nextPatientLocation);
          setRecommendedHospitals(sourceHospitals);
          setRecommendedIds(sourceHospitals.map((hospital) => hospital.id));
          setSelectedHospitalId(sourceHospitals[0]?.id ?? nextRecommendations[0]?.hospitalId ?? null);
          setRecommendations(nextRecommendations);
          setCaseState(nextRecommendations.some((candidate) => candidate.warnings.length) ? 'warning' : 'success');
          setCurrentStepId(null);
          setIsDone(true);
        } catch {
          setCaseState('error');
          setCurrentStepId(null);
        }
      }, 2400);
      timersRef.current.push(finishTimer);
    },
    [chiefComplaint, clearTimers, locationInput, notes, severity, specialty, visibleHospitals],
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-surface text-[var(--color-text-primary)]">
      <CommandTopBar clock={clock} />

      <main className="grid min-h-0 flex-1 grid-cols-[340px_minmax(420px,1fr)_440px] overflow-x-auto overflow-y-hidden max-xl:grid-cols-[320px_minmax(420px,1fr)_400px]">
        <CaseIntakePanel
          locationInput={locationInput}
          chiefComplaint={chiefComplaint}
          severity={severity}
          specialty={specialty}
          notes={notes}
          isRunning={isRunning}
          onLocationChange={setLocationInput}
          onComplaintChange={setChiefComplaint}
          onSeverityChange={setSeverity}
          onSpecialtyChange={setSpecialty}
          onNotesChange={setNotes}
          onGenerate={handleGenerate}
          onReset={handleReset}
          onPreset={handlePreset}
        />

        <section className="relative min-w-0 border-x border-[var(--color-border)] bg-surface">
          <div className="absolute right-5 top-5 z-[600] max-w-[360px] rounded-lg border border-[var(--color-border)] bg-card/95 p-3 shadow-md backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
              <MapPinned className="h-4 w-4 text-teal" />
              Jakarta spatial context
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Map context supports orientation. Destination ranking remains the decision source.
            </p>
          </div>
          <MapView
            filters={filters}
            patientLocation={patientLocation}
            recommendedIds={recommendedIds}
            selectedHospitalId={selectedHospitalId}
            onFiltersChange={handleFiltersChange}
            onHospitalClick={handleHospitalSelect}
            onHospitalsChange={setVisibleHospitals}
          />
        </section>

        <RecommendationPanel
          activeCase={activeCase}
          caseState={caseState}
          isDone={isDone}
          currentStepId={currentStepId}
          topRecommendation={topRecommendation}
          recommendations={recommendations}
          alerts={alerts}
          selectedHospitalId={selectedHospitalId}
          onSelect={setSelectedHospitalId}
        />
      </main>
    </div>
  );
}

function CommandTopBar({ clock }: { clock: string }) {
  return (
    <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-navy px-4 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-teal">
          <MapPinned className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-white">
            <Cross className="h-2.5 w-2.5" />
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight text-white">AGATA</h1>
          <p className="truncate text-xs text-white/55">Agentic GeoAI Dispatcher Support</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <StatusPill icon={<Wifi className="h-3.5 w-3.5" />} label="System online" tone="teal" />
        <StatusPill icon={<RefreshCw className="h-3.5 w-3.5" />} label="Beds synced 2 min ago" />
        <StatusPill icon={<MapPin className="h-3.5 w-3.5" />} label="DKI Jakarta" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 font-mono text-white/80">
          <Clock3 className="h-3.5 w-3.5 text-teal" />
          {clock}
        </span>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white" aria-label="Help">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function StatusPill({
  icon,
  label,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'neutral' | 'teal';
}) {
  return (
    <span
      className={`hidden items-center gap-1.5 rounded-full px-2 py-1 text-white/80 lg:inline-flex ${
        tone === 'teal' ? 'bg-teal/20 text-teal' : 'bg-white/10'
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function CaseIntakePanel({
  locationInput,
  chiefComplaint,
  severity,
  specialty,
  notes,
  isRunning,
  onLocationChange,
  onComplaintChange,
  onSeverityChange,
  onSpecialtyChange,
  onNotesChange,
  onGenerate,
  onReset,
  onPreset,
}: {
  locationInput: string;
  chiefComplaint: string;
  severity: Severity;
  specialty: Specialty;
  notes: string;
  isRunning: boolean;
  onLocationChange: (value: string) => void;
  onComplaintChange: (value: string) => void;
  onSeverityChange: (value: Severity) => void;
  onSpecialtyChange: (value: Specialty) => void;
  onNotesChange: (value: string) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onPreset: (preset: PresetCase) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-white/10 bg-navy text-white">
      <div className="border-b border-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Dispatcher intake</p>
        <h2 className="mt-1 text-lg font-bold text-white">Active incident case</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/60">
          Capture the caller report, generate a destination recommendation, and hand off the decision to the ambulance team.
        </p>
      </div>

      <form onSubmit={onGenerate} className="sidebar-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <FieldLabel label="Patient location" />
        <div className="flex gap-2">
          <input
            value={locationInput}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Street, landmark, or district"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary)] focus:border-teal focus:ring-1 focus:ring-teal"
          />
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
            aria-label="Pin patient from map"
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>

        <div>
          <FieldLabel label="Severity" />
          <div className="grid grid-cols-2 gap-2">
            {SEVERITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSeverityChange(item)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  severity === item
                    ? item === 'Critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-teal text-white'
                    : 'bg-white/10 text-white/70 hover:bg-navy-light hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel label="Chief complaint" />
          <input
            value={chiefComplaint}
            onChange={(event) => onComplaintChange(event.target.value)}
            placeholder="Example: chest pain, trauma, stroke symptoms"
            className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary)] focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>

        <div>
          <FieldLabel label="Requested specialist" />
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSpecialtyChange(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                  specialty === item
                    ? 'bg-teal text-white'
                    : 'border border-white/15 text-white/70 hover:bg-navy-light hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel label="Optional notes" />
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={4}
            placeholder="Operational notes, caller context, access constraints"
            className="w-full resize-none rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary)] focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel label="Quick presets" />
          {PRESET_CASES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPreset(preset)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </form>

      <div className="space-y-2 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => onGenerate()}
          disabled={isRunning}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-teal-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <HospitalIcon className="h-4 w-4" />
          {isRunning ? 'Calculating recommendation...' : 'Generate Recommendation'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-navy-light hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Case
        </button>
      </div>
    </aside>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/65">
      {label}
    </label>
  );
}

function RecommendationPanel({
  activeCase,
  caseState,
  isDone,
  currentStepId,
  topRecommendation,
  recommendations,
  alerts,
  selectedHospitalId,
  onSelect,
}: {
  activeCase: ActiveCase | null;
  caseState: CaseState;
  isDone: boolean;
  currentStepId: number | null;
  topRecommendation: RecommendationCandidate | null;
  recommendations: RecommendationCandidate[];
  alerts: string[];
  selectedHospitalId: number | null;
  onSelect: (hospitalId: number) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col bg-surface">
      <div className="border-b border-[var(--color-border)] bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Decision support</p>
        <h2 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
          Hospital recommendation
        </h2>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <OperationalAlerts alerts={alerts} state={caseState} />
        <CaseSummary activeCase={activeCase} />
        <ProcessTransparency currentStepId={currentStepId} isDone={isDone} />

        {caseState === 'empty' ? <EmptyRecommendationState /> : null}
        {caseState === 'loading' ? <LoadingRecommendationState /> : null}
        {caseState !== 'empty' && caseState !== 'loading' && topRecommendation ? (
          <>
            <TopRecommendationCard candidate={topRecommendation} />
            <RankedAlternatives
              candidates={recommendations.slice(1)}
              selectedHospitalId={selectedHospitalId}
              onSelect={onSelect}
            />
          </>
        ) : null}
      </div>
    </aside>
  );
}

function OperationalAlerts({ alerts, state }: { alerts: string[]; state: CaseState }) {
  const tone = state === 'error' || state === 'no-match' ? 'red' : alerts.length ? 'amber' : 'green';
  return (
    <section
      className={`rounded-lg border p-3 shadow-sm ${
        tone === 'red'
          ? 'border-red-200 bg-red-50 text-red-700'
          : tone === 'amber'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {tone === 'red' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        Operational alerts
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-relaxed">
        {alerts.length ? alerts.map((alert) => <li key={alert}>{alert}</li>) : <li>No blocking alerts.</li>}
      </ul>
    </section>
  );
}

function CaseSummary({ activeCase }: { activeCase: ActiveCase | null }) {
  if (!activeCase) {
    return (
      <section className="rounded-lg border border-[var(--color-border)] bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Case summary</h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          No active case yet. The dispatcher intake panel remains visible while recommendations are reviewed.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Active case summary</h3>
        <span className="rounded-full bg-surface px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {formatInputTime(activeCase.inputTime)}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <SummaryItem label="Location" value={activeCase.location} />
        <SummaryItem label="Severity" value={activeCase.severity} />
        <SummaryItem label="Complaint" value={activeCase.complaint} />
        <SummaryItem label="Specialist" value={activeCase.specialty} />
        <SummaryItem label="Operator" value={activeCase.dispatcher} />
        <SummaryItem label="Notes" value={activeCase.notes || 'No extra notes'} />
      </dl>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {label}
      </dt>
      <dd className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

function ProcessTransparency({
  currentStepId,
  isDone,
}: {
  currentStepId: number | null;
  isDone: boolean;
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">AGATA process check</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {mockAgentSteps.map((step) => {
          const complete = isDone || (currentStepId !== null && step.id < currentStepId);
          const running = currentStepId === step.id;
          return (
            <span
              key={step.id}
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                complete
                  ? 'bg-emerald-50 text-emerald-700'
                  : running
                    ? 'bg-teal/10 text-teal'
                    : 'bg-surface text-[var(--color-text-secondary)]'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {step.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function EmptyRecommendationState() {
  return (
    <section className="rounded-lg border border-dashed border-[var(--color-border)] bg-card p-5 text-center shadow-sm">
      <FileText className="mx-auto h-8 w-8 text-teal" />
      <h3 className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Awaiting incident input
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Enter a patient location, complaint, severity, and specialist need. The recommendation panel will show a ranked destination list with explainable trade-offs.
      </p>
    </section>
  );
}

function LoadingRecommendationState() {
  return (
    <section className="space-y-3 rounded-lg border border-[var(--color-border)] bg-card p-4 shadow-sm">
      <div className="h-5 w-48 rounded skeleton-shimmer" />
      <div className="h-16 rounded skeleton-shimmer" />
      <div className="grid grid-cols-4 gap-2">
        <div className="h-12 rounded skeleton-shimmer" />
        <div className="h-12 rounded skeleton-shimmer" />
        <div className="h-12 rounded skeleton-shimmer" />
        <div className="h-12 rounded skeleton-shimmer" />
      </div>
    </section>
  );
}

function TopRecommendationCard({ candidate }: { candidate: RecommendationCandidate }) {
  return (
    <section className="rounded-lg border-2 border-teal bg-card p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal px-2.5 py-1 text-xs font-bold text-white">Rank #1</span>
            <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
              {candidate.statusBadge}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold leading-tight text-[var(--color-text-primary)]">
            {candidate.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{candidate.district}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            AGATA Index
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums text-teal">
            {candidate.score.toFixed(2)}
          </p>
        </div>
      </div>

      <AERIBadge
        bedsAvailable={candidate.availableBeds}
        erStatus={candidate.erStatus}
        specialistPresent={candidate.specialistStatus !== 'Unavailable'}
        etaMinutes={candidate.etaMinutes}
      />

      <div className="mt-4 grid grid-cols-4 gap-2">
        <MetricTile icon={<TrafficCone className="h-4 w-4" />} label="ETA" value={`${candidate.etaMinutes} min`} />
        <MetricTile
          icon={<BedDouble className="h-4 w-4" />}
          label="Beds"
          value={`${candidate.availableBeds}/${candidate.capacity}`}
        />
        <MetricTile icon={<Stethoscope className="h-4 w-4" />} label="Specialist" value={candidate.specialistStatus} />
        <MetricTile icon={<Layers className="h-4 w-4" />} label="Level" value={candidate.hospitalLevel.split('/')[0].trim()} />
      </div>

      <div className="mt-4 rounded-lg bg-surface p-3">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Why this is recommended
        </h4>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {candidate.reasons.slice(0, 4).map((reason) => (
            <li key={reason} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-teal-muted">
          Select Destination
        </button>
        <button className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-surface">
          Confirm Recommendation
        </button>
      </div>
    </section>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-card p-2">
      <div className="flex items-center gap-1.5 text-teal">{icon}</div>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-0.5 truncate font-mono text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function RankedAlternatives({
  candidates,
  selectedHospitalId,
  onSelect,
}: {
  candidates: RecommendationCandidate[];
  selectedHospitalId: number | null;
  onSelect: (hospitalId: number) => void;
}) {
  if (!candidates.length) return null;

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
        Ranked alternatives
      </h3>
      <div className="space-y-2">
        {candidates.map((candidate) => {
          const selected = selectedHospitalId === candidate.hospitalId;
          return (
            <button
              key={candidate.hospitalId}
              type="button"
              onClick={() => onSelect(candidate.hospitalId)}
              className={`w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-colors duration-150 ${
                selected ? 'border-teal bg-teal/5' : 'border-[var(--color-border)] hover:border-teal/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-teal">Rank #{candidate.rank}</p>
                  <h4 className="mt-0.5 truncate text-sm font-semibold text-[var(--color-text-primary)]">
                    {candidate.name}
                  </h4>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{candidate.miniReason}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold tabular-nums text-teal">
                    {candidate.score.toFixed(2)}
                  </p>
                  <p className="text-[0.68rem] text-[var(--color-text-secondary)]">score</p>
                  <AERIBadge
                    bedsAvailable={candidate.availableBeds}
                    erStatus={candidate.erStatus}
                    specialistPresent={candidate.specialistStatus !== 'Unavailable'}
                    etaMinutes={candidate.etaMinutes}
                    compact
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-[0.68rem] text-[var(--color-text-secondary)]">
                <span className="font-mono tabular-nums">{candidate.etaMinutes} min</span>
                <span className="font-mono tabular-nums">{candidate.availableBeds} beds</span>
                <span>{candidate.specialistStatus}</span>
                <span>{candidate.erStatus}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
