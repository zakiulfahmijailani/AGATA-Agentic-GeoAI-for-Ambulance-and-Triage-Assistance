# DATASET SPECIFICATION — AGATA

> **For Codex:** This document defines exactly what data is in scope for each TRL phase.
> DO NOT implement data integrations beyond what is marked ✅ for the current phase (TRL 3 MVP).

---

## Current Phase: TRL 3 MVP

**Rule:** Data RS sudah real dari OpenStreetMap (bukan mock lagi). No external API calls for data. No real patient data.

---

## Dataset 1 — 🏥 Rumah Sakit Jakarta (PRIMARY)

**Status: ✅ SELESAI — 234 RS REAL sudah di-seed ke Neon PostgreSQL `agata-db`**

> ✅ **Update 24 Mei 2026:** Data RS sudah bukan mock 15 RS lagi.
> Sekarang ada **234 RS Jakarta real** hasil scraping OpenStreetMap via Overpass API,
> sudah melalui 4 tahap cleaning, dan sudah di-seed ke tabel `hospitals` di Neon.

Data statis fasilitas kesehatan Jakarta yang tersedia:

| Field | Type | Status MVP | Full System |
|---|---|---|---|
| `id` | integer | ✅ Auto-increment | ✅ Real |
| `name` | string | ✅ Real (OSM) | ✅ Dinkes DKI |
| `address` | string | ✅ Real (OSM, 234/234) | ✅ Dinkes DKI |
| `phone` | string | ⚠️ Parsial (12/234 punya) | ✅ Dinkes DKI |
| `zone` | enum (5 zona) | ✅ Kalkulasi dari koordinat | ✅ Batas administratif |
| `lat` / `lng` | float | ✅ Real (OSM) | ✅ OpenStreetMap |
| `capacity` | integer | ⚠️ Estimasi (sebagian dari OSM `beds`) | 🔴 SIRS Online Kemenkes |
| `available_beds` | integer | ⚠️ Estimasi random seeded | 🔴 Real-time Satu Data Jakarta |
| `er_status` | AVAILABLE/BUSY/FULL | ⚠️ Derive dari OSM `emergency` tag | 🔴 Real-time API |
| `trauma_level` | 1/2/3 | ✅ Derive dari nama RS | ✅ Tipe A/B/C RS |
| `operator` | string | ✅ Real (OSM) | ✅ Dinkes DKI |
| `operator_type` | string | ✅ Real (OSM) | ✅ Dinkes DKI |
| `website` | string | ✅ Real (OSM, 25/234 punya) | ✅ Dinkes DKI |
| `osm_id` | bigint | ✅ Real | - |

**Distribusi data di Neon (agata-db) saat ini:**

| Zona | Jumlah RS |
|---|---|
| Pusat | 123 |
| Selatan | 45 |
| Utara | 30 |
| Barat | 21 |
| Timur | 15 |
| **Total** | **234** |

| Trauma Level | Jumlah | Keterangan |
|---|---|---|
| Level 1 | 8 | RS Nasional/Tipe A (RSCM, Fatmawati, Dharmais, dll) |
| Level 2 | 30 | RSUD/RS Pemerintah Daerah |
| Level 3 | 196 | RS Swasta / RS Khusus |

**Sumber data:** OpenStreetMap via Overpass API (diambil 24 Mei 2026)
**Sumber real lengkap (TRL 4+):** Dinas Kesehatan DKI Jakarta, SIRS Online Kemenkes

> ⛔ **Codex:** Jangan buat integrasi API ke Dinkes atau SIRS. Gunakan data yang sudah di-seed di Neon. Jangan truncate atau drop tabel `hospitals` tanpa izin eksplisit.

---

## Dataset 2 — 🚑 Data Ambulans & Respons

**Status: ❌ TIDAK ADA DI MVP — Dari Cardiff (in-kind contribution)**

Data ini dibutuhkan untuk validasi:
- Spatiotemporal ambulance response time Jakarta
- Rute perjalanan ambulans per kejadian
- Jumlah armada ambulans per zona
- Golden hour compliance rate

**Sumber:** Dinas Gulkarmat DKI Jakarta, data riset Cardiff (Brice et al., 2024 — Monte Carlo)

**Referensi:** Jailani et al., 2023 (IEEE Xplore) — data historis ambulans Jakarta sudah dipublikasikan.

**MVP workaround:** Posisi ambulans = titik klik user di peta. Tidak ada fleet data.

> ⛔ **Codex:** Jangan implement fleet management, response time calculation real, atau routing ambulans. Posisi ambulans cukup dari input koordinat user (klik peta).

---

## Dataset 3 — 👤 Data Pasien / Kejadian Darurat

**Status: ❌ TIDAK ADA DI MVP — Cardiff field survey contribution**

Data minimal yang dibutuhkan untuk validasi (TRL 4):
- Lokasi kejadian (koordinat panggilan 119)
- Timestamp panggilan
- RS tujuan yang dipilih dispatcher
- Outcome (berhasil/tidak dalam golden hour)

**Sumber:** Cardiff University menyediakan field survey data sebagai in-kind contribution.

> ⛔ **Codex:** Jangan buat form input pasien, database pasien, atau apapun yang menyimpan data medis. Bukan scope MVP dan ada implikasi etika riset.

---

## Dataset 4 — 🗺️ Data Geospasial Infrastruktur Jakarta

**Status: ⚠️ PARSIAL — Batas administratif tersedia dari GADM, road network belum**

- ✅ Batas administratif Jakarta → sudah ada dari **GADM** (dimiliki researcher)
- ❌ Jaringan jalan (road network) → **OSRM / OpenStreetMap** — TRL 4
- ❌ Titik kemacetan / traffic data → **Google Maps API / HERE Maps** — TRL 4
- ❌ Zona kepadatan penduduk → **BPS Jakarta** — TRL 4

**MVP workaround:** Gunakan **Euclidean distance** (jarak lurus) via PostGIS `ST_Distance` — cukup untuk TRL 3.

> ⛔ **Codex:** Jangan implement OSRM, Google Maps Directions API, atau road network routing. Gunakan `ST_Distance` atau Haversine formula.

---

## Dataset 5 — 📊 Data Embedding / Semantik (Vector DB)

**Status: ❌ TIDAK ADA DI MVP — Fase Pinecone (TRL 4+)**

Dibutuhkan untuk LLM orchestrator memahami query natural language:
- Embedding nama lokasi Jakarta (kelurahan, landmark, nama jalan)
- Embedding query ambulans (variasi cara dispatcher menyebut lokasi)
- Geocoding dictionary (nama informal → koordinat resmi)

> ⛔ **Codex:** Jangan install atau implement Pinecone, pgvector, atau embedding API apapun. Bukan scope MVP.

---

## Ringkasan Prioritas Dataset

| Prioritas | Dataset | Status MVP | Fase |
|---|---|---|---|
| 🔴 Wajib | Lokasi + kapasitas RS Jakarta | ✅ **234 RS Real (OSM → Neon)** | TRL 3 ✅ |
| 🔴 Wajib | Road network / routing | ⚠️ Euclidean workaround | TRL 3 |
| 🟡 Penting | Batas administratif Jakarta | ✅ Tersedia dari GADM | TRL 3 |
| 🟡 Penting | Respons time ambulans historis | ❌ Dari Cardiff | TRL 4 |
| 🟡 Penting | Data pasien darurat minimal | ❌ Dari Cardiff (Monte Carlo) | TRL 4 |
| 🟢 Opsional | Embedding lokasi Jakarta | ❌ Pinecone fase berikutnya | TRL 4+ |

---

## Database Schema (Neon PostgreSQL — agata-db)

Schema tabel `hospitals` yang aktif di Neon saat ini:

```sql
CREATE TABLE hospitals (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  address         TEXT DEFAULT '',
  phone           VARCHAR(50) DEFAULT '',
  zone            VARCHAR(20) NOT NULL,  -- 'Pusat'|'Selatan'|'Timur'|'Utara'|'Barat'
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  location        GEOMETRY(Point, 4326),
  capacity        INTEGER DEFAULT 100,
  available_beds  INTEGER DEFAULT 20,
  er_status       VARCHAR(20) DEFAULT 'BUSY',  -- 'AVAILABLE'|'BUSY'|'FULL'
  trauma_level    INTEGER DEFAULT 3,           -- 1|2|3
  operator        TEXT DEFAULT '',
  operator_type   VARCHAR(50) DEFAULT '',
  website         TEXT DEFAULT '',
  osm_id          BIGINT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX hospitals_location_gist ON hospitals USING GIST(location);
```

**Koneksi:** Gunakan `DATABASE_URL` dari env (sudah otomatis inject oleh Vercel dari Neon integration).

---

## API Routes Tersedia

| Endpoint | Fungsi | Status |
|---|---|---|
| `GET /api/health` | Cek koneksi Neon + hitung total RS | ✅ Done |
| `GET /api/hospitals` | Semua RS, opsional sort by jarak (`?lat=&lng=`) | ✅ Done |
| `GET /api/hospitals/nearest` | RS terdekat via ST_DWithin (`?lat=&lng=&radius=10000&limit=3`) | ✅ Done |

> ✅ **Codex:** Gunakan endpoint yang sudah ada. Jangan buat API route baru kecuali ada kebutuhan UI yang tidak bisa dipenuhi oleh 3 endpoint di atas.
