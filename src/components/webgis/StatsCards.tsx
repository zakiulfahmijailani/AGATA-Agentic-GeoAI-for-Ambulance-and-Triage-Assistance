'use client';

import { useEffect, useMemo, useState } from 'react';
import type { HealthApiResponse } from '@/types';

interface StatCard {
  value: string;
  label: string;
  unit: string;
  color: string;
}

const fallbackStats: StatCard[] = [
  { value: '-', label: 'Reachable Hospitals', unit: 'hospitals', color: '#00B4B4' },
  { value: '-', label: 'Available Capacity', unit: 'of total', color: '#00B4B4' },
  { value: '-', label: 'Total Capacity', unit: 'estimated beds', color: '#00B4B4' },
  { value: '-', label: 'Database', unit: 'Neon + PostGIS', color: '#00B4B4' },
];

export default function StatsCards() {
  const [health, setHealth] = useState<HealthApiResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHealth() {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) return;
        const data = (await response.json()) as HealthApiResponse;
        if (isMounted) setHealth(data);
      } catch {
        if (isMounted) setHealth(null);
      }
    }

    void loadHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo<StatCard[]>(() => {
    if (!health) return fallbackStats;

    const availableBeds = health.available_beds ?? 0;
    const capacity = health.capacity ?? 0;
    const availabilityPercent = capacity > 0 ? Math.round((availableBeds / capacity) * 100) : 0;

    return [
      {
        value: String(health.hospitals_count ?? health.hospital_count ?? 0),
        label: 'Reachable Hospitals',
        unit: 'hospitals',
        color: '#00B4B4',
      },
      {
        value: `${availabilityPercent}%`,
        label: 'Available Capacity',
        unit: 'of total',
        color: '#00B4B4',
      },
      {
        value: availableBeds.toLocaleString('id-ID'),
        label: 'Available Beds',
        unit: `${capacity.toLocaleString('id-ID')} total`,
        color: '#00B4B4',
      },
      {
        value: health.status === 'connected' ? 'Live' : 'Offline',
        label: 'Database',
        unit: 'Neon + PostGIS',
        color: '#00B4B4',
      },
    ];
  }, [health]);

  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/80">
        Operational Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--color-border)] bg-card p-3 shadow-md"
          >
            <div className="text-2xl font-bold leading-none" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="mt-2 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              {stat.label}
            </div>
            <div className="mt-1 text-[0.68rem] text-[var(--color-text-secondary)]">
              {stat.unit}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
