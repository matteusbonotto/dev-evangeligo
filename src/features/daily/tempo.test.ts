import { describe, expect, it } from "vitest";
import { calcularTempoAteReset } from "./tempo";

describe("calcularTempoAteReset", () => {
  it("faltando 1 segundo pra meia-noite, mostra 00:00:01", () => {
    const umSegundoAntes = new Date(2026, 0, 1, 23, 59, 59, 0);
    expect(calcularTempoAteReset(umSegundoAntes).texto).toBe("00:00:01");
  });

  it("ao meio-dia, faltam exatamente 12 horas", () => {
    const meioDia = new Date(2026, 0, 1, 12, 0, 0, 0);
    const resultado = calcularTempoAteReset(meioDia);
    expect(resultado.horas).toBe(12);
    expect(resultado.minutos).toBe(0);
    expect(resultado.segundos).toBe(0);
  });

  it("nunca fica negativo", () => {
    const resultado = calcularTempoAteReset(new Date(2026, 0, 1, 23, 59, 59, 999));
    expect(resultado.horas).toBeGreaterThanOrEqual(0);
    expect(resultado.minutos).toBeGreaterThanOrEqual(0);
    expect(resultado.segundos).toBeGreaterThanOrEqual(0);
  });
});
