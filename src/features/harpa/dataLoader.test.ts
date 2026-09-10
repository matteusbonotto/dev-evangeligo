import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetCacheParaTeste,
  getHino,
  listarHinos,
  loadHarpaData,
  parseHino,
} from "./dataLoader";
import type { HarpaData } from "./types";

const harpaFake: HarpaData = {
  // Entrada de metadados real do mirror de origem (sem `hino`/`verses`) —
  // ver comentário de `ehHinoValido` em dataLoader.ts. Precisa ser
  // ignorada, não tratada como um hino quebrado.
  "-1": {
    Author: "Daniel Liberato da Silva",
    github: "https://github.com/DanielLiberato",
  } as unknown as HarpaData[string],
  "1": {
    hino: "1 - Chuvas de Graça",
    coro: "Chuvas de graça, <br> Chuvas pedimos, Senhor;",
    verses: {
      "1": "Deus prometeu com certeza <br> Chuvas de graça mandar;",
      "2": "Cristo nos tem concedido <br> O santo Consolador,",
    },
  },
  "2": {
    hino: "2 - Sem Coro",
    verses: {
      "1": "Estrofe única.",
    },
  },
};

beforeEach(() => {
  _resetCacheParaTeste();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(harpaFake) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadHarpaData", () => {
  it("busca o arquivo JSON em /data/harpa-crista.json e cacheia", async () => {
    await loadHarpaData();
    await loadHarpaData();
    expect(fetch).toHaveBeenCalledWith("/data/harpa-crista.json");
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
    await expect(loadHarpaData()).rejects.toThrow(
      "Não foi possível carregar a Harpa Cristã.",
    );
  });
});

describe("parseHino", () => {
  it("separa número e título, divide linhas por <br>, ordena estrofes", () => {
    const hino = parseHino(1, harpaFake["1"]);
    expect(hino.numero).toBe(1);
    expect(hino.titulo).toBe("Chuvas de Graça");
    expect(hino.coro).toEqual(["Chuvas de graça,", "Chuvas pedimos, Senhor;"]);
    expect(hino.estrofes).toEqual([
      {
        numero: 1,
        linhas: ["Deus prometeu com certeza", "Chuvas de graça mandar;"],
      },
      {
        numero: 2,
        linhas: ["Cristo nos tem concedido", "O santo Consolador,"],
      },
    ]);
  });

  it("coro é null quando o hino não tem coro", () => {
    const hino = parseHino(2, harpaFake["2"]);
    expect(hino.coro).toBeNull();
  });
});

describe("listarHinos", () => {
  it("retorna número e título de todos os hinos, ordenados numericamente", async () => {
    const lista = await listarHinos();
    expect(lista).toEqual([
      { numero: 1, titulo: "Chuvas de Graça" },
      { numero: 2, titulo: "Sem Coro" },
    ]);
  });

  it("ignora a entrada de metadados '-1' em vez de quebrar", async () => {
    const lista = await listarHinos();
    expect(lista.some((hino) => hino.numero === -1)).toBe(false);
  });
});

describe("getHino", () => {
  it("retorna o hino já parseado", async () => {
    const hino = await getHino(1);
    expect(hino?.titulo).toBe("Chuvas de Graça");
  });

  it("retorna undefined para hino inexistente", async () => {
    expect(await getHino(999)).toBeUndefined();
  });

  it("retorna undefined para a entrada de metadados '-1'", async () => {
    expect(await getHino(-1)).toBeUndefined();
  });
});
