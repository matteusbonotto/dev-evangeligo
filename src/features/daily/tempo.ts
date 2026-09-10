export interface TempoAteReset {
  horas: number;
  minutos: number;
  segundos: number;
  /** Formatado "HH:MM:SS", pronto pra exibir no cronômetro decrescente. */
  texto: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Quanto falta até a próxima meia-noite local — é isso que "reseta" os destaques do dia (ver `desafios.ts`, a chave do dia muda sozinha). */
export function calcularTempoAteReset(agora: Date = new Date()): TempoAteReset {
  const proximaMeiaNoite = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const restanteMs = Math.max(0, proximaMeiaNoite.getTime() - agora.getTime());
  const horas = Math.floor(restanteMs / 3_600_000);
  const minutos = Math.floor((restanteMs % 3_600_000) / 60_000);
  const segundos = Math.floor((restanteMs % 60_000) / 1000);
  return { horas, minutos, segundos, texto: `${pad2(horas)}:${pad2(minutos)}:${pad2(segundos)}` };
}
