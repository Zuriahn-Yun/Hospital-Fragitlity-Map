interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#22c55e';
      case 'down': return '#dc2626';
      default: return '#4a5568';
    }
  };

  return (
    <div
      className="rounded-xl p-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: '#B4D4FF',
        border: '2px solid #86B6F6',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#176B87' }}>
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight" style={{ color: '#1a2332' }}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: getTrendColor() }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
