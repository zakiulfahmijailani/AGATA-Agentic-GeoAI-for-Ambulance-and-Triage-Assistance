import { dashboardStats } from '@/lib/mock/dashboardStats';

export default function StatsCards() {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        Ringkasan Operasional
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {dashboardStats.map((stat) => (
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
          </div>
        ))}
      </div>
    </section>
  );
}
