# DATASET SPECIFICATION — AGATA

> **For Codex:** This document defines exactly what data is in scope for each TRL phase.
> DO NOT implement data integrations beyond what is marked ✅ for the current phase (TRL 3 MVP).

---

## Current Phase: TRL 3 MVP

**Rule:** Only mock/seed data is used. No external API calls for data. No real patient data.

---

## Dataset 1 — 🏥 Rumah Sakit Jakarta (PRIMARY)

**Status: ✅ WAJIB — Sudah ada sebagai mock data**

Data statis fasilitas kesehatan Jakarta yang dibutuhkan:

| Field | Type | MVP | Full System |
|---|---|---|---|
| `id` | integer | ✅ Mock | ✅ Real |
| `name` | string | ✅ Mock | ✅ Dinkes DKI |
| `address` | string | ✅ Mock | ✅ Dinkes DKI |
| `phone` | string | ✅ Mock | ✅ Dinkes DKI |
| `zone` | enum (5 zona) | ✅ Mock | ✅ Dinkes DKI |
| `lat` / `lng` | float | ✅ Mock | ✅ OpenStreetMap |
| `capacity` | integer | ✅ Mock | 🔴 SIRS Online Kemenkes |
| `available_beds` | integer | ✅ Mock (static) | 🔴 Real-time Satu Data Jakarta |
| `er_status` | AVAILABLE/BUSY/FULL | ✅ Mock (static) | 🔴 Real-time API |
| `trauma_level` | 1/2/3 | ✅ Mock | ✅ Tipe A/B/C RS |

**Sumber real (TRL 4+):** Dinas Kesehatan DKI Jakarta, SIRS Online Kemenkes, OpenStreetMap

**Mock data:** 15 RS Jakarta, 5 zona (Pusat, Selatan, Timur, Utara, Barat) — seed ada di Neon PostgreSQL `agata-db`.

> ⛔ **Codex:** Jangan buat integrasi API ke Dinkes atau SIRS. Gunakan data yang sudah di-seed di Neon.

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

> ⛔ **Codex:** Jangan implement apapun terkait fleet management, response time calculation real, atau routing ambulans. Bukan scope MVP.

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

**Status: ❌ BELUM DI MVP — Fase berikutnya**

Dibutuhkan untuk routing dan analisis spasial nyata:
- Jaringan jalan (road network) Jakarta → **OSRM / OpenStreetMap**
- Batas administratif kelurahan/kecamatan/kota → **BPS Jakarta / BAPPEDA DKI**
- Titik kemacetan / traffic data → **Google Maps API / HERE Maps**
- Zona kepadatan penduduk → **BPS Jakarta**

**MVP workaround:** Gunakan **Euclidean distance** (jarak lurus/garis lurus) via PostGIS `ST_Distance` — ini cukup untuk mendemonstrasikan konsep di TRL 3.

> ⛔ **Codex:** Jangan implement OSRM, Google Maps Directions API, atau road network routing. Gunakan ST_Distance atau Euclidean formula biasa.

---

## Dataset 5 — 📊 Data Embedding / Semantik (Vector DB)

**Status: ❌ TIDAK ADA DI MVP — Fase Pinecone (TRL 4+)**

Dibutuhkan untuk LLM orchestrator memahami query natural language:
- Embedding nama lokasi Jakarta (kelurahan, landmark, nama jalan)
- Embedding query ambulans (variasi cara dispatcher menyebut lokasi)
- Geocoding dictionary (nama informal → koordinat resmi)

**Sumber rencana:** Generate dari OpenRouter + Google Maps API + data lokal.

> ⛔ **Codex:** Jangan install atau implement Pinecone, pgvector, atau embedding API apapun. Bukan scope MVP.

---

## Ringkasan Prioritas Dataset

| Prioritas | Dataset | Status MVP | Fase |
|---|---|---|---|
| 🔴 Wajib | Lokasi + kapasitas RS Jakarta | ✅ Mock (15 RS, Neon) | TRL 3 |
| 🔴 Wajib | Road network / routing | ⚠️ Euclidean workaround | TRL 3 |
| 🟡 Penting | Respons time ambulans historis | ❌ Dari Cardiff | TRL 4 |
| 🟡 Penting | Data pasien darurat minimal | ❌ Dari Cardiff (Monte Carlo) | TRL 4 |
| 🟢 Opsional | Embedding lokasi Jakarta | ❌ Pinecone fase berikutnya | TRL 4+ |
| 🟢 Opsional | Batas administratif | ❌ Fase berikutnya | TRL 4+ |

---

## Database Schema (Neon PostgreSQL — agata-db)

Tabel `hospitals` yang sudah ada di Neon:

```sql
CREATE TABLE hospitals (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     TEXT,
  phone       VARCHAR(50),
  zone        VARCHAR(20),  -- 'Pusat' | 'Selatan' | 'Timur' | 'Utara' | 'Barat'
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  location    GEOMETRY(Point, 4326),  -- PostGIS spatial column
  capacity    INTEGER,
  available_beds INTEGER,
  er_status   VARCHAR(20),  -- 'AVAILABLE' | 'BUSY' | 'FULL'
  trauma_level INTEGER,     -- 1 | 2 | 3
  created_at  TIMESTAMP DEFAULT NOW()
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

> ✅ **Codex:** Gunakan endpoint yang sudah ada ini. Jangan buat API route baru kecuali ada kebutuhan UI yang tidak bisa dipenuhi oleh 3 endpoint di atas.
