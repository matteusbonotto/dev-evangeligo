import { useEffect, useState } from "react";
import { calcularTempoAteReset } from "./tempo";

/** Cronômetro decrescente até a meia-noite local (quando os destaques do dia trocam) — atualiza a cada segundo. */
export function useContagemRegressiva(): string {
  const [texto, setTexto] = useState(() => calcularTempoAteReset().texto);

  useEffect(() => {
    const id = setInterval(() => {
      setTexto(calcularTempoAteReset().texto);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return texto;
}
