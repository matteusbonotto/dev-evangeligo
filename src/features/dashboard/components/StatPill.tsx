interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tone?: "gold" | "green";
}

export function StatPill({
  icon,
  value,
  label,
  tone = "green",
}: StatPillProps) {
  return (
    <span className={`stat-pill stat-pill--${tone}`}>
      {icon}
      <strong>{value}</strong>
      <span className="stat-pill-label">{label}</span>
    </span>
  );
}
