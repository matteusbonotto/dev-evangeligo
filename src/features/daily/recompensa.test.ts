import { beforeEach, describe, expect, it } from "vitest";
import { criarUsuarioDeTeste } from "../rpg/testUtils";
import { creditarRecompensaDeJogo, marcarDestaquePassivoVisto } from "./recompensa";

beforeEach(() => {
  localStorage.clear();
});

const AGORA = new Date("2026-09-08T10:00:00.000Z");

describe("creditarRecompensaDeJogo", () => {
  it("credita a recompensa normalmente quando não é o desafio de hoje", () => {
    const usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    const resultado = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      agora: AGORA,
    });
    expect(resultado.gold).toBe(25);
  });

  it("quando o id jogado bate com o de hoje, credita e marca o desafio concluído", () => {
    const usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    const resultado = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      desafioDiario: { tipo: "termo", idJogado: "termo-graca", idDeHoje: "termo-graca" },
      agora: AGORA,
    });
    expect(resultado.gold).toBe(25);
  });

  it("não credita de novo se o desafio de hoje já foi concluído (evita duplicar)", () => {
    let usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    usuario = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      desafioDiario: { tipo: "termo", idJogado: "termo-graca", idDeHoje: "termo-graca" },
      agora: AGORA,
    });
    const segunda = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      desafioDiario: { tipo: "termo", idJogado: "termo-graca", idDeHoje: "termo-graca" },
      agora: AGORA,
    });
    expect(segunda.gold).toBe(25); // não subiu pra 50
  });

  it("jogar um desafio diferente do de hoje credita normalmente (sem marcar o dia)", () => {
    const usuario = criarUsuarioDeTeste({ gold: 0, xp: 0 });
    const resultado = creditarRecompensaDeJogo({
      usuario,
      reward: { xp: 50, gold: 25 },
      desafioDiario: { tipo: "termo", idJogado: "termo-pastor", idDeHoje: "termo-graca" },
      agora: AGORA,
    });
    expect(resultado.gold).toBe(25);
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
