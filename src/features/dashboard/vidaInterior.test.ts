import { describe, expect, it } from "vitest";
import {
  calcularEntradasVidaInterior,
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

describe("obterParesDoCheckinHoje", () => {
  it("o mesmo dia sempre escolhe os mesmos pares (determinístico)", () => {
    const a = obterParesDoCheckinHoje("2026-09-15");
    const b = obterParesDoCheckinHoje("2026-09-15");
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it("escolhe a quantidade pedida, sem repetir o mesmo par 2x no mesmo dia", () => {
    const pares = obterParesDoCheckinHoje("2026-09-15", 2);
    expect(pares).toHaveLength(2);
    expect(new Set(pares.map((p) => p.id)).size).toBe(2);
  });

  it("dias diferentes tendem a escolher pares diferentes (não trava sempre nos 2 primeiros)", () => {
    const dias = [
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ];
    const combinacoes = new Set(
      dias.map((dia) =>
        obterParesDoCheckinHoje(dia)
          .map((p) => p.id)
          .join(","),
      ),
    );
    expect(combinacoes.size).toBeGreaterThan(1);
  });
});
