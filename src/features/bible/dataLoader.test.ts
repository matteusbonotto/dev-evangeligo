import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetCacheParaTeste,
  getCapituloVersiculos,
  getVersiculoTexto,
  loadBibliaData,
} from "./dataLoader";
import type { BibliaData } from "./types";

const bibliaFake: BibliaData = {
  translation: "Teste",
  abbreviation: "teste",
  language: "Portuguese",
  source: "https://exemplo.test",
  sourceVersion: "0.0.0",
  sourceLicense: "GPL",
  generatedAt: "2026-01-01T00:00:00.000Z",
  books: {
    "1": [["Versículo 1.1", "Versículo 1.2"], ["Versículo 2.1"]],
  },
};

beforeEach(() => {
  _resetCacheParaTeste();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(bibliaFake),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadBibliaData", () => {
  it("busca o arquivo JSON em /data/biblia-almeida.json", async () => {
    await loadBibliaData();
    expect(fetch).toHaveBeenCalledWith("/data/biblia-almeida.json");
  });

  it("cacheia o resultado — chamadas subsequentes não refazem o fetch", async () => {
    await loadBibliaData();
    await loadBibliaData();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("lança erro quando a resposta não é ok", async () => {
    _resetCacheParaTeste();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, json: () => Promise.resolve(null) }),
    );
    await expect(loadBibliaData()).rejects.toThrow(
      "Não foi possível carregar o texto bíblico.",
    );
  });
});

describe("getCapituloVersiculos", () => {
  it("retorna os versículos do capítulo pedido", async () => {
    await expect(getCapituloVersiculos(1, 1)).resolves.toEqual([
      "Versículo 1.1",
      "Versículo 1.2",
    ]);
    await expect(getCapituloVersiculos(1, 2)).resolves.toEqual([
      "Versículo 2.1",
    ]);
  });

  it("lança erro para capítulo inexistente", async () => {
    await expect(getCapituloVersiculos(1, 99)).rejects.toThrow(
      /não encontrado/,
    );
  });

  it("lança erro para livro inexistente", async () => {
    await expect(getCapituloVersiculos(999, 1)).rejects.toThrow(
      /não encontrado/,
    );
  });
});

describe("getVersiculoTexto", () => {
  it("retorna o texto do versículo pedido", async () => {
    await expect(getVersiculoTexto(1, 1, 2)).resolves.toBe("Versículo 1.2");
  });

  it("lança erro para versículo inexistente no capítulo", async () => {
    await expect(getVersiculoTexto(1, 1, 99)).rejects.toThrow(
      /não encontrado/,
    );
  });
});
