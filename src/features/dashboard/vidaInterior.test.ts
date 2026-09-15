import { describe, expect, it } from "vitest";
import {
  calcularEntradasVidaInterior,
  obterChaveDaSemana,
  obterParesDoCheckinHoje,
} from "./vidaInterior";
import { PARES_VIDA_INTERIOR } from "./data/paresVidaInterior";

describe("calcularEntradasVidaInterior", () => {
  it("sem nenhum check-in, todo par fica 0x0 ('sem dados ainda', nunca um número fixo/fake)", () => {
    const entradas = calcularEntradasVidaInterior([]);
    expect(entradas).toHaveLength(PARES_VIDA_INTERIOR.length);
    for (const entrada of entradas) {
      expect(entrada.fruitValue).toBe(0);
      expect(entrada.fleshValue).toBe(0);
    }
  });

  it("conta check-ins reais por par, separando fruto de carne", () => {
    const entradas = calcularEntradasVidaInterior([
      { par_id: "amor", escolha: "fruto" },
      { par_id: "amor", escolha: "fruto" },
      { par_id: "amor", escolha: "carne" },
      { par_id: "paz", escolha: "carne" },
    ]);

    const amor = entradas.find((e) => e.id === "amor")!;
    expect(amor.fruitValue).toBe(2);
    expect(amor.fleshValue).toBe(1);

    const paz = entradas.find((e) => e.id === "paz")!;
    expect(paz.fruitValue).toBe(0);
    expect(paz.fleshValue).toBe(1);

    const alegria = entradas.find((e) => e.id === "alegria")!;
    expect(alegria.fruitValue).toBe(0);
    expect(alegria.fleshValue).toBe(0);
  });

  it("preserva a metadata (rótulos/explicação) de cada par do catálogo", () => {
    const [primeiro] = calcularEntradasVidaInterior([]);
    expect(primeiro.fruitLabel).toBe(PARES_VIDA_INTERIOR[0].fruitLabel);
    expect(primeiro.explicacao).toBe(PARES_VIDA_INTERIOR[0].explicacao);
  });
});

describe("obterParesDoCheckinHoje (agenda semanal fixa)", () => {
  it("o mesmo dia sempre escolhe os mesmos pares (determinístico)", () => {
    const a = obterParesDoCheckinHoje("2026-09-15");
    const b = obterParesDoCheckinHoje("2026-09-15");
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it("nunca repete o mesmo par 2x no mesmo dia", () => {
    for (const dia of ["2026-09-14", "2026-09-17"]) {
      const pares = obterParesDoCheckinHoje(dia);
      expect(new Set(pares.map((p) => p.id)).size).toBe(pares.length);
    }
  });

  it("uma semana corrida (7 dias) cobre os 9 pares exatamente 1 vez cada — a queixa 'só mostra 2, como medir o resto' fica resolvida por construção", () => {
    // 2026-09-13 é domingo — 1 semana completa domingo a sábado.
    const semana = [
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
    ];
    const idsDaSemana = semana.flatMap((dia) =>
      obterParesDoCheckinHoje(dia).map((p) => p.id),
    );
    expect(idsDaSemana).toHaveLength(PARES_VIDA_INTERIOR.length);
    expect(new Set(idsDaSemana).size).toBe(PARES_VIDA_INTERIOR.length);
    for (const par of PARES_VIDA_INTERIOR) {
      expect(idsDaSemana).toContain(par.id);
    }
  });

  it("a agenda é FIXA por dia da semana, não sorteada — o mesmo dia da semana repete os mesmos pares toda semana", () => {
    const domingoSemana1 = obterParesDoCheckinHoje("2026-09-13").map(
      (p) => p.id,
    );
    const domingoSemana2 = obterParesDoCheckinHoje("2026-09-20").map(
      (p) => p.id,
    );
    expect(domingoSemana2).toEqual(domingoSemana1);
  });
});

describe("obterChaveDaSemana", () => {
  it("qualquer dia da mesma semana corrida devolve a MESMA chave (o domingo daquela semana)", () => {
    const chaves = new Set(
      [
        "2026-09-13",
        "2026-09-14",
        "2026-09-15",
        "2026-09-16",
        "2026-09-17",
        "2026-09-18",
        "2026-09-19",
      ].map(obterChaveDaSemana),
    );
    expect(chaves.size).toBe(1);
    expect([...chaves][0]).toBe("2026-09-13");
  });

  it("a semana seguinte tem uma chave diferente", () => {
    expect(obterChaveDaSemana("2026-09-20")).not.toBe(
      obterChaveDaSemana("2026-09-13"),
    );
  });
});
