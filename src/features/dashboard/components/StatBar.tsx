interface StatBarProps {
  label: string;
  value: number;
  max: number;
  icon?: React.ReactNode;
}

export function StatBar({ label, value, max, icon }: StatBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span>
          {icon}
          {label}
        </span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div
        className="stat-bar-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
