import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetCacheReferenciasParaTeste,
  formatarReferenciaCruzada,
  obterReferenciasCruzadas,
} from "./referenciasCruzadas";

const dataFake = {
  "GEN:1:1": [["JHN", 1, 1, 1, 3]],
  "MAT:1:1": [
    ["GEN", 22, 18, 22, 18],
    ["ROM", 1, 3, 2, 5],
  ],
};

beforeEach(() => {
  _resetCacheReferenciasParaTeste();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataFake),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("obterReferenciasCruzadas", () => {
  it("retorna as referências de um versículo com cross-refs", async () => {
    await expect(obterReferenciasCruzadas("GEN", 1, 1)).resolves.toEqual([
      { livro: "JHN", capituloInicio: 1, versiculoInicio: 1, capituloFim: 1, versiculoFim: 3 },
    ]);
  });

  it("retorna array vazio para um versículo sem cross-refs", async () => {
    await expect(obterReferenciasCruzadas("GEN", 1, 2)).resolves.toEqual([]);
  });

  it("cacheia o resultado — chamadas subsequentes não refazem o fetch", async () => {
    await obterReferenciasCruzadas("GEN", 1, 1);
    await obterReferenciasCruzadas("MAT", 1, 1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("nunca lança erro quando o fetch falha — degrada pra 'sem referências'", async () => {
    _resetCacheReferenciasParaTeste();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede caiu")));
    await expect(obterReferenciasCruzadas("GEN", 1, 1)).resolves.toEqual([]);
  });

  it("nunca lança erro quando a resposta não é ok", async () => {
    _resetCacheReferenciasParaTeste();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(null) }),
    );
    await expect(obterReferenciasCruzadas("GEN", 1, 1)).resolves.toEqual([]);
  });
});

describe("formatarReferenciaCruzada", () => {
  it("formata uma referência de 1 versículo só: 'Jo 1:1'", () => {
    expect(
      formatarReferenciaCruzada({
        livro: "JHN",
        capituloInicio: 1,
        versiculoInicio: 1,
        capituloFim: 1,
        versiculoFim: 1,
      }),
    ).toBe("Jo 1:1");
  });

  it("formata um intervalo no mesmo capítulo: 'Pv 8:22-30'", () => {
    expect(
      formatarReferenciaCruzada({
        livro: "PRO",
        capituloInicio: 8,
        versiculoInicio: 22,
        capituloFim: 8,
        versiculoFim: 30,
      }),
    ).toBe("Pv 8:22-30");
  });

  it("formata um intervalo entre capítulos: 'Rm 1:3-2:5'", () => {
    expect(
      formatarReferenciaCruzada({
        livro: "ROM",
        capituloInicio: 1,
        versiculoInicio: 3,
        capituloFim: 2,
        versiculoFim: 5,
      }),
    ).toBe("Rm 1:3-2:5");
  });

  it("usa o próprio código quando não há abreviação conhecida (defensivo)", () => {
    expect(
      formatarReferenciaCruzada({
        livro: "XXX",
        capituloInicio: 1,
        versiculoInicio: 1,
        capituloFim: 1,
        versiculoFim: 1,
      }),
    ).toBe("XXX 1:1");
  });
});
