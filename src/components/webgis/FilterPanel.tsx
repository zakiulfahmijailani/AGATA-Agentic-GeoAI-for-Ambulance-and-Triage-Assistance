'use client';

import { Activity, Layers, MapPinned } from 'lucide-react';
import type { ERFilter, HospitalFilters, TraumaFilter, ZoneFilter } from '@/types';

interface FilterPanelProps {
  filters: HospitalFilters;
  total: number;
  isLoading?: boolean;
  onChange: (filters: HospitalFilters) => void;
}

const zoneOptions: ZoneFilter[] = ['All', 'Pusat', 'Selatan', 'Timur', 'Utara', 'Barat'];
const traumaOptions: Array<{ value: TraumaFilter; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 1, label: 'Level 1 (RS Nasional)' },
  { value: 2, label: 'Level 2 (RSUD)' },
  { value: 3, label: 'Level 3 (Swasta)' },
];
const erOptions: Array<{ value: ERFilter; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Busy' },
];

export default function FilterPanel({ filters, total, isLoading = false, onChange }: FilterPanelProps) {
  return (
    <div className="absolute left-5 top-5 z-[500] w-[min(560px,calc(100%-2.5rem))] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 text-[var(--color-text)] shadow-xl shadow-black/20 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-[var(--color-teal)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Filter RS Jakarta
          </span>
        </div>
        <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
          {isLoading ? 'Memuat...' : `${total} RS`}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <FilterGroup icon={<MapPinned className="h-3.5 w-3.5" />} label="Zona">
          <div className="flex flex-wrap gap-1.5">
            {zoneOptions.map((zone) => (
              <FilterButton
                key={zone}
                isActive={filters.zone === zone}
                onClick={() => onChange({ ...filters, zone })}
              >
                {zone}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup icon={<Layers className="h-3.5 w-3.5" />} label="Trauma">
          <div className="flex flex-wrap gap-1.5">
            {traumaOptions.map((option) => (
              <FilterButton
                key={String(option.value)}
                isActive={filters.traumaLevel === option.value}
                onClick={() => onChange({ ...filters, traumaLevel: option.value })}
              >
                {option.label}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup icon={<Activity className="h-3.5 w-3.5" />} label="ER">
          <div className="flex flex-wrap gap-1.5">
            {erOptions.map((option) => (
              <FilterButton
                key={option.value}
                isActive={filters.erStatus === option.value}
                onClick={() => onChange({ ...filters, erStatus: option.value })}
              >
                {option.label}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-[0.68rem] font-semibold transition ${
        isActive
          ? 'border-teal-300 bg-teal-400/15 text-teal-100'
          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:border-sky-400/60 hover:text-[var(--color-text)]'
      }`}
    >
      {children}
    </button>
  );
}
