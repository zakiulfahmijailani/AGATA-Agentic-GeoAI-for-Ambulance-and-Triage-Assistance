interface KpiCardProps {
  value: string;
  label: string;
  color?: string;
}

export default function KpiCard({ value, label, color = '#0ea5e9' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div className="text-[1.75rem] font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </div>
    </div>
  );
}
