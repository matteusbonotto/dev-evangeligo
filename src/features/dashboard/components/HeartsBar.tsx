import { GiHearts } from "react-icons/gi";

interface HeartsBarProps {
  hearts: number;
  maxHearts: number;
}

export function HeartsBar({ hearts, maxHearts }: HeartsBarProps) {
  return (
    <div
      className="hearts"
      role="img"
      aria-label={`${hearts} de ${maxHearts} corações`}
    >
      {Array.from({ length: maxHearts }, (_, i) => (
        <GiHearts
          key={i}
          className={i < hearts ? "heart" : "heart heart--empty"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
