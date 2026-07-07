interface KpiCardProps {
  value: string;
  label: string;
  color?: string;
}

export default function KpiCard({ value, label, color = '#00B4B4' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-card p-3 shadow-md">
      <div className="text-xl font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {label}
      </div>
    </div>
  );
}
