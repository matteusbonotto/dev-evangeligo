import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _resetCacheParaTeste } from "./dataLoader";
import { obterCapituloTraduzido } from "./traducoes";
import type { BibliaData, Livro } from "./types";

const livroJoao: Livro = {
  order: 43,
  codigo: "JHN",
  nome: "João",
  testamento: "NT",
  grupo: "evangelhos",
  totalCapitulos: 21,
};

const bibliaLocalFake: BibliaData = {
  translation: "Teste",
  abbreviation: "teste",
  language: "Portuguese",
  source: "https://exemplo.test",
  sourceVersion: "0.0.0",
  sourceLicense: "GPL",
  generatedAt: "2026-01-01T00:00:00.000Z",
  books: {
    "43": [["Texto local (Almeida Atualizada) do versículo 1."]],
  },
};

function respostaJson(corpo: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(corpo) });
}

beforeEach(() => {
  localStorage.clear();
  _resetCacheParaTeste();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("obterCapituloTraduzido — aa (local)", () => {
  it("usa o arquivo local, sem chamar fetch de tradução ao vivo", async () => {
    const fetchMock = vi.fn(() => respostaJson(bibliaLocalFake));
    vi.stubGlobal("fetch", fetchMock);

    await expect(obterCapituloTraduzido(livroJoao, 1, "aa")).resolves.toEqual([
      "Texto local (Almeida Atualizada) do versículo 1.",
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/data/biblia-almeida.json");
  });
});

describe("obterCapituloTraduzido — arib (bible-api.com, fallback getbible almeida)", () => {
  it("busca em bible-api.com primeiro", async () => {
    const fetchMock = vi.fn((url: string) => {
      expect(url).toBe("https://bible-api.com/data/almeida/JHN/1");
      return respostaJson({ verses: [{ verse: 1, text: "Texto ARIB v1." }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(obterCapituloTraduzido(livroJoao, 1, "arib")).resolves.toEqual(
      ["Texto ARIB v1."],
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("cai para getbible/almeida quando bible-api.com falha", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("bible-api.com"))
        return Promise.reject(new Error("timeout"));
      expect(url).toBe("https://api.getbible.net/v2/almeida/43/1.json");
      return respostaJson({
        verses: [{ verse: 1, text: "Texto getbible almeida v1." }],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(obterCapituloTraduzido(livroJoao, 1, "arib")).resolves.toEqual(
      ["Texto getbible almeida v1."],
    );
  });

  it("cai para o texto local quando as 2 fontes de rede falham", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("bible-api.com") || url.includes("api.getbible.net")) {
        return Promise.reject(new Error("offline"));
      }
      return respostaJson(bibliaLocalFake);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(obterCapituloTraduzido(livroJoao, 1, "arib")).resolves.toEqual(
      ["Texto local (Almeida Atualizada) do versículo 1."],
    );
  });

  it("cacheia o capítulo — uma segunda chamada não refaz o fetch", async () => {
    const fetchMock = vi.fn(() =>
      respostaJson({ verses: [{ verse: 1, text: "Texto ARIB v1." }] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await obterCapituloTraduzido(livroJoao, 1, "arib");
    await obterCapituloTraduzido(livroJoao, 1, "arib");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("obterCapituloTraduzido — livre (getbible livre, fallback livretr)", () => {
  it("busca em getbible/livre primeiro", async () => {
    const fetchMock = vi.fn((url: string) => {
      expect(url).toBe("https://api.getbible.net/v2/livre/43/1.json");
      return respostaJson({
        verses: [{ verse: 1, text: "Texto Bíblia Livre v1." }],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      obterCapituloTraduzido(livroJoao, 1, "livre"),
    ).resolves.toEqual(["Texto Bíblia Livre v1."]);
  });

  it("cai para getbible/livretr quando a fonte primária falha", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/livre/")) return Promise.reject(new Error("timeout"));
      expect(url).toBe("https://api.getbible.net/v2/livretr/43/1.json");
      return respostaJson({
        verses: [{ verse: 1, text: "Texto livretr v1." }],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      obterCapituloTraduzido(livroJoao, 1, "livre"),
    ).resolves.toEqual(["Texto livretr v1."]);
  });
});
