'use client';

import { BedDouble, ExternalLink, MapPin, Navigation } from 'lucide-react';
import { ER_STATUS_COLOR, ER_STATUS_LABEL, type Hospital } from '@/types';

interface HospitalCardProps {
  hospital: Hospital;
  rank: number;
  distance: number;
  isRecommended?: boolean;
  onSelect?: (hospital: Hospital) => void;
}

const rankColors: Record<number, string> = {
  1: '#fbbf24',
  2: '#cbd5e1',
  3: '#d97706',
};

export default function HospitalCard({
  hospital,
  rank,
  distance,
  isRecommended = true,
  onSelect,
}: HospitalCardProps) {
  const capacityPercent =
    hospital.capacity > 0 ? Math.round((hospital.available_beds / hospital.capacity) * 100) : 0;
  const distanceLabel = hospital.distance_km ?? distance;

  return (
    <article
      className="animate-slide-in-right rounded-lg border bg-[var(--color-surface)] p-4 shadow-xl shadow-black/10"
      style={{
        borderColor: isRecommended
          ? `${ER_STATUS_COLOR[hospital.er_status]}66`
          : 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-950"
          style={{ backgroundColor: rankColors[rank] ?? '#94a3b8' }}
        >
          #{rank}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-[var(--color-text)]">{hospital.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {hospital.zone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" />
              {distanceLabel.toFixed(1)} km
            </span>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-bold uppercase"
          style={{
            backgroundColor: `${ER_STATUS_COLOR[hospital.er_status]}20`,
            color: ER_STATUS_COLOR[hospital.er_status],
          }}
        >
          {ER_STATUS_LABEL[hospital.er_status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase">
        <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-200">
          Zona {hospital.zone}
        </span>
        <span className="rounded-full bg-teal-500/15 px-2 py-1 text-teal-200">
          TL{hospital.trauma_level}
        </span>
        {hospital.operator_type ? (
          <span className="rounded-full bg-slate-500/15 px-2 py-1 text-slate-300">
            {hospital.operator_type}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {hospital.available_beds} / {hospital.capacity} tersedia
          </span>
          <span>{hospital.phone || 'No phone'}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor: ER_STATUS_COLOR[hospital.er_status],
            }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
        <p className="line-clamp-2">{hospital.address}</p>
        {hospital.operator ? <p>Operator: {hospital.operator}</p> : null}
        {hospital.website ? (
          <a
            href={hospital.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sky-300 transition hover:text-sky-200"
          >
            Website
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(hospital)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <MapPin className="h-4 w-4" />
          Lihat di Peta
        </button>
      ) : null}
    </article>
  );
}
