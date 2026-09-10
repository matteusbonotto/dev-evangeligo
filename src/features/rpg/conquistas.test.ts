import { describe, expect, it } from "vitest";
import { verificarNovasConquistas } from "./conquistas";
import { criarUsuarioDeTeste } from "./testUtils";

describe("verificarNovasConquistas", () => {
  it("não desbloqueia nada quando nenhuma condição é satisfeita", () => {
    const usuario = criarUsuarioDeTeste();
    const resultado = verificarNovasConquistas(usuario);
    expect(resultado).toBe(usuario); // mesma referência: nenhuma mutação
  });

  it("desbloqueia uma conquista de nível e credita a recompensa", () => {
    const usuario = criarUsuarioDeTeste({ level: 10, gold: 0, xp: 0 });
    const resultado = verificarNovasConquistas(usuario);
    const conquista = resultado.achievements.find((a) => a.id === "em-ascensao");
    expect(conquista).toBeDefined();
    expect(resultado.gold).toBe(50); // reward.gold de "Em Ascensão"
  });

  it("desbloqueia uma conquista de sequência (usa bestStreak, não streakDays)", () => {
    const usuario = criarUsuarioDeTeste({ bestStreak: 7 });
    const resultado = verificarNovasConquistas(usuario);
    expect(resultado.achievements.some((a) => a.id === "constancia")).toBe(true);
  });

  it("não desbloqueia de novo uma conquista já presente em achievements", () => {
    const usuario = criarUsuarioDeTeste({
      level: 10,
      achievements: [
        {
          id: "em-ascensao",
          title: "Em Ascensão",
          description: "Alcançou o nível 10.",
          rarity: "raro",
          unlockedAt: "2026-01-01",
        },
      ],
    });
    const resultado = verificarNovasConquistas(usuario);
    expect(resultado).toBe(usuario);
  });

  it("pode desbloquear mais de uma conquista na mesma verificação", () => {
    const usuario = criarUsuarioDeTeste({ level: 10, bestStreak: 7, gold: 0 });
    const resultado = verificarNovasConquistas(usuario);
    expect(resultado.achievements.map((a) => a.id).sort()).toEqual(
      ["constancia", "em-ascensao"].sort(),
    );
    expect(resultado.gold).toBe(80); // 50 (em-ascensao) + 30 (constancia)
  });
});
