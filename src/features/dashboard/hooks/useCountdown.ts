import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h${minutes}` : `${hours}h`;
}

export function useCountdown(expiresAt?: string): string | null {
  const [remaining, setRemaining] = useState<string | null>(() =>
    expiresAt
      ? formatRemaining(new Date(expiresAt).getTime() - Date.now())
      : null,
  );

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const update = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setRemaining(ms > 0 ? formatRemaining(ms) : null);
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
