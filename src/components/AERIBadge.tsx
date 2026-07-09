import { computeAERI, aeriLabel, type AERIInput } from '@/lib/aeri';

interface AERIBadgeProps extends AERIInput {
  compact?: boolean;
}

export function AERIBadge({ compact = false, ...input }: AERIBadgeProps) {
  const score = computeAERI(input);
  const { label, color } = aeriLabel(score);

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: 600,
          color,
          background: `${color}18`,
          borderRadius: '9999px',
          padding: '2px 8px',
          marginLeft: '6px',
          letterSpacing: '0.02em',
        }}
        title={`AERI Readiness Score: ${score}`}
      >
        AERI {score}
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 0',
        borderTop: '1px solid #E2E8F0',
        marginTop: '8px',
      }}
    >
      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
        AERI Readiness
      </span>
      <div
        style={{
          flex: 1,
          height: '6px',
          background: '#E2E8F0',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score * 100}%`,
            height: '100%',
            background: color,
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color, minWidth: '32px' }}>
        {score}
      </span>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color,
          background: `${color}18`,
          borderRadius: '4px',
          padding: '2px 6px',
        }}
      >
        {label}
      </span>
    </div>
  );
}
