interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  height?: string;
}

export function ProgressBar({
  value,
  max = 1,
  colorClass = 'bg-blue-500',
  height = 'h-1'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full overflow-hidden rounded-full ${height}`} style={{ backgroundColor: '#334155' }}>
      <div
        className={`${height} rounded-full ${colorClass} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
