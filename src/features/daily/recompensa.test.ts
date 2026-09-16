import { beforeEach, describe, expect, it } from "vitest";
import { criarUsuarioDeTeste } from "../rpg/testUtils";
import { creditarRecompensaDeJogo, marcarDestaquePassivoVisto } from "./recompensa";

beforeEach(() => {
  localStorage.clear();
});

const AGORA = new Date("2026-09-08T10:00:00.000Z");

describe("creditarRecompensaDeJogo", () => {
  it("credita a recompensa cheia na 1ª vitória do dia pra aquele tipo de jogo", () => {
    const usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    const resultado = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: AGORA,
    });
    expect(resultado.recompensaCheia).toBe(true);
    expect(resultado.recompensa).toEqual({ xp: 50, gold: 25 });
    expect(resultado.usuario.gold).toBe(25);
  });

  it("achado real da auditoria: uma 2ª vitória do MESMO tipo no MESMO dia dá só a recompensa reduzida, não farma o valor cheio de novo", () => {
    let usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    const primeira = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: AGORA,
    });
    usuario = primeira.usuario;

    const segunda = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: AGORA,
    });
    expect(segunda.recompensaCheia).toBe(false);
    expect(segunda.recompensa).toEqual({ xp: 5, gold: 2 });
    expect(segunda.usuario.gold).toBe(27); // 25 (1ª) + 2 (2ª, reduzida) — nunca 50
  });

  it("um tipo de jogo diferente no mesmo dia ainda ganha a recompensa cheia (o limite é por tipo, não geral)", () => {
    let usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    usuario = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: AGORA,
    }).usuario;

    const quebra = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "quebra",
      agora: AGORA,
    });
    expect(quebra.recompensaCheia).toBe(true);
    expect(quebra.usuario.gold).toBe(50);
  });

  it("no dia seguinte, volta a dar a recompensa cheia (o limite reseta por dia)", () => {
    let usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    usuario = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: AGORA,
    }).usuario;

    const amanha = new Date(AGORA);
    amanha.setDate(amanha.getDate() + 1);
    const resultado = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      tipo: "termo",
      agora: amanha,
    });
    expect(resultado.recompensaCheia).toBe(true);
    expect(resultado.recompensa).toEqual({ xp: 50, gold: 25 });
  });
});

describe("marcarDestaquePassivoVisto", () => {
  it("credita na primeira vez do dia", () => {
    const usuario = criarUsuarioDeTeste({ gold: 0 });
    const resultado = marcarDestaquePassivoVisto(usuario, "versiculo", { xp: 5, gold: 2 }, AGORA);
    expect(resultado.gold).toBe(2);
  });

  it("não credita de novo no mesmo dia", () => {
    let usuario = criarUsuarioDeTeste({ gold: 0 });
    usuario = marcarDestaquePassivoVisto(usuario, "versiculo", { xp: 5, gold: 2 }, AGORA);
    const segunda = marcarDestaquePassivoVisto(usuario, "versiculo", { xp: 5, gold: 2 }, AGORA);
    expect(segunda.gold).toBe(2);
  });
});
