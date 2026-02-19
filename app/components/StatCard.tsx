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
      case 'down': return '#ef4444';
      default: return '#8899aa';
    }
  };

  return (
    <div
      className="rounded-xl p-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: '#1f2b3d',
        border: '2px solid #2a3a4e',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5ab0c5' }}>
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight" style={{ color: '#e0e8f0' }}>
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
