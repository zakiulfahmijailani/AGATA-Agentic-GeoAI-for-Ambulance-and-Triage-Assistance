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
  { value: '-', label: 'RS Terjangkau', unit: 'rumah sakit', color: '#0ea5e9' },
  { value: '-', label: 'Kapasitas Bebas', unit: 'dari total', color: '#22c55e' },
  { value: '-', label: 'Kapasitas Total', unit: 'estimasi bed', color: '#14b8a6' },
  { value: '-', label: 'Database', unit: 'Neon + PostGIS', color: '#818cf8' },
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
        label: 'RS Terjangkau',
        unit: 'rumah sakit',
        color: '#0ea5e9',
      },
      {
        value: `${availabilityPercent}%`,
        label: 'Kapasitas Bebas',
        unit: 'dari total',
        color: '#22c55e',
      },
      {
        value: availableBeds.toLocaleString('id-ID'),
        label: 'Bed Tersedia',
        unit: `${capacity.toLocaleString('id-ID')} total`,
        color: '#14b8a6',
      },
      {
        value: health.status === 'connected' ? 'Live' : 'Offline',
        label: 'Database',
        unit: 'Neon + PostGIS',
        color: '#818cf8',
      },
    ];
  }, [health]);

  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        Ringkasan Operasional
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 shadow-sm"
          >
            <div className="text-2xl font-bold leading-none" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {stat.label}
            </div>
            <div className="mt-1 text-[0.68rem] text-[var(--color-text-faint)]">{stat.unit}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
