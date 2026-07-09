'use client';

import { BedDouble, ExternalLink, MapPin, Navigation } from 'lucide-react';
import { getHospitalReadinessResult } from '@/lib/aeri';
import { ER_STATUS_COLOR, ER_STATUS_LABEL, ZONE_LABEL, type Hospital } from '@/types';

interface HospitalCardProps {
  hospital: Hospital;
  rank: number;
  distance: number;
  isRecommended?: boolean;
  onSelect?: (hospital: Hospital) => void;
}

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
  const readiness = getHospitalReadinessResult(hospital);

  return (
    <article
      className={`animate-slide-in-right rounded-lg border bg-card p-3 shadow-md transition-all duration-150 hover:border-teal/50 hover:shadow-md ${
        isRecommended ? 'border-teal bg-teal/5' : 'border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {hospital.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {ZONE_LABEL[hospital.zone]}
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
        <span className="rounded-full bg-teal/10 px-2 py-1 text-teal">
          Zone {ZONE_LABEL[hospital.zone]}
        </span>
        <span className="rounded-full bg-teal/10 px-2 py-1 text-teal">
          TL{hospital.trauma_level}
        </span>
        <span className="rounded-full border border-[var(--color-border)] bg-surface px-2 py-1 text-[var(--color-text-secondary)]">
          AERI {Math.round(readiness.scoreUsed)} / {readiness.category}
        </span>
        {hospital.operator_type ? (
          <span className="rounded-full border border-[var(--color-border)] bg-surface px-2 py-1 text-[var(--color-text-secondary)]">
            {hospital.operator_type}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {hospital.available_beds} / {hospital.capacity} available
          </span>
          <span>{hospital.phone || 'No phone'}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor: ER_STATUS_COLOR[hospital.er_status],
            }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
        <p className="line-clamp-2">{hospital.address}</p>
        {hospital.operator ? <p>Operator: {hospital.operator}</p> : null}
        {hospital.website ? (
          <a
            href={hospital.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-teal transition-colors duration-150 hover:text-teal-muted"
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-teal-muted focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <MapPin className="h-4 w-4" />
          View on Map
        </button>
      ) : null}
    </article>
  );
}
