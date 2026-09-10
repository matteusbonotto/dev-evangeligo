import { describe, expect, it } from "vitest";
import { aplicarRecompensaAoUsuario } from "./progresso";
import { criarUsuarioDeTeste } from "./testUtils";

describe("aplicarRecompensaAoUsuario", () => {
  it("soma ouro diretamente", () => {
    const usuario = criarUsuarioDeTeste({ gold: 50 });
    const resultado = aplicarRecompensaAoUsuario(usuario, { xp: 0, gold: 30 });
    expect(resultado.gold).toBe(80);
  });

  it("soma XP dentro do nível atual sem estourar xpToNextLevel", () => {
    const usuario = criarUsuarioDeTeste({ level: 1, xp: 10, xpToNextLevel: 100, gold: 0 });
    const resultado = aplicarRecompensaAoUsuario(usuario, { xp: 20, gold: 0 });
    expect(resultado.level).toBe(1);
    expect(resultado.xp).toBe(30);
    expect(resultado.xpToNextLevel).toBe(100);
  });

  it("sobe de nível quando a recompensa ultrapassa o XP necessário", () => {
    const usuario = criarUsuarioDeTeste({ level: 1, xp: 90, xpToNextLevel: 100, gold: 0 });
    const resultado = aplicarRecompensaAoUsuario(usuario, { xp: 50, gold: 0 });
    expect(resultado.level).toBe(2);
    expect(resultado.xp).toBe(40); // 90 + 50 = 140 total; nível 1 custa 100 -> sobra 40 no nível 2
  });

  it("restaura corações sem passar do máximo", () => {
    const usuario = criarUsuarioDeTeste({ hearts: 4, maxHearts: 5 });
    const resultado = aplicarRecompensaAoUsuario(usuario, { xp: 0, gold: 0, hearts: 3 });
    expect(resultado.hearts).toBe(5);
  });

  it("nunca deixa o ouro negativo mesmo com uma recompensa negativa", () => {
    const usuario = criarUsuarioDeTeste({ gold: 5 });
    const resultado = aplicarRecompensaAoUsuario(usuario, { xp: 0, gold: -100 });
    expect(resultado.gold).toBe(0);
  });
});
