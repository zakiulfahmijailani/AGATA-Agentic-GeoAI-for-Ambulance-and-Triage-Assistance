'use client';

import { BedDouble, Building2, MapPin, Navigation } from 'lucide-react';
import { BED_STATUS_COLOR, BED_STATUS_LABEL, getBedStatus, Hospital } from '@/types';

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
  const bedStatus = getBedStatus(hospital);
  const capacityPercent = Math.round((hospital.bedsAvailable / hospital.totalBeds) * 100);

  return (
    <article
      className="animate-slide-in-right rounded-lg border bg-[var(--color-surface)] p-4 shadow-xl shadow-black/10"
      style={{
        borderColor: isRecommended ? `${BED_STATUS_COLOR[bedStatus]}66` : 'var(--color-border)',
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
              <Building2 className="h-3.5 w-3.5" />
              {hospital.shortName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" />
              {distance.toFixed(1)} km
            </span>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-bold uppercase"
          style={{
            backgroundColor: `${BED_STATUS_COLOR[bedStatus]}20`,
            color: BED_STATUS_COLOR[bedStatus],
          }}
        >
          {BED_STATUS_LABEL[bedStatus]}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {hospital.bedsAvailable} / {hospital.totalBeds} tersedia
          </span>
          <span>{hospital.level}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor: BED_STATUS_COLOR[bedStatus],
            }}
          />
        </div>
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
