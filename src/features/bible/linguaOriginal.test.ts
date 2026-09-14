import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { obterPalavrasOriginais } from "./linguaOriginal";
import type { Livro } from "./types";

const genesis: Livro = {
  order: 1,
  codigo: "GEN",
  nome: "Gênesis",
  testamento: "AT",
  grupo: "lei",
  totalCapitulos: 50,
};

const joao: Livro = {
  order: 43,
  codigo: "JHN",
  nome: "João",
  testamento: "NT",
  grupo: "evangelhos",
  totalCapitulos: 21,
};

function respostaJson(corpo: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(corpo) });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("obterPalavrasOriginais — Antigo Testamento (hebraico, WLCa)", () => {
  it("extrai palavra e número de Strong (prefixo H) e busca a definição de cada um", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/WLCa/1/1/1/")) {
        expect(url).toBe("https://bolls.life/get-verse/WLCa/1/1/1/");
        return respostaJson({
          text: "בְּרֵאשִׁית<S>7225</S> בָּרָא<S>1254</S>",
        });
      }
      if (url.includes("dictionary-definition/BDBT/H7225")) {
        return respostaJson([
          {
            topic: "H7225",
            lexeme: "רֵאשִׁית",
            transliteration: "rêʼshîyth",
            pronunciation: "ray-sheeth",
            short_definition: "beginning",
            definition: "<p>first, beginning</p>",
          },
        ]);
      }
      if (url.includes("dictionary-definition/BDBT/H1254")) {
        return respostaJson([
          {
            topic: "H1254",
            lexeme: "בָּרָא",
            transliteration: "bârâʼ",
            pronunciation: "baw-raw",
            short_definition: "create",
            definition: "<p>to create</p>",
          },
        ]);
      }
      throw new Error(`URL inesperada: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const palavras = await obterPalavrasOriginais(genesis, 1, 1);
    expect(palavras).toEqual([
      {
        palavra: "בְּרֵאשִׁית",
        strong: "H7225",
        definicao: {
          strong: "H7225",
          lexema: "רֵאשִׁית",
          transliteracao: "rêʼshîyth",
          pronuncia: "ray-sheeth",
          definicaoResumo: "beginning",
          definicaoCompleta: "first, beginning",
        },
      },
      {
        palavra: "בָּרָא",
        strong: "H1254",
        definicao: {
          strong: "H1254",
          lexema: "בָּרָא",
          transliteracao: "bârâʼ",
          pronuncia: "baw-raw",
          definicaoResumo: "create",
          definicaoCompleta: "to create",
        },
      },
    ]);
  });
});

describe("obterPalavrasOriginais — Novo Testamento (grego, TISCH)", () => {
  it("extrai palavra e número de Strong (prefixo G)", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/TISCH/43/3/16/")) {
        expect(url).toBe("https://bolls.life/get-verse/TISCH/43/3/16/");
        return respostaJson({ text: "οὕτως<S>3779</S> γὰρ<S>1063</S>" });
      }
      return respostaJson([
        {
          topic: "G3779",
          lexeme: "οὕτω",
          transliteration: "houtō",
          pronunciation: "hoo'-to",
          short_definition: "thus",
          definition: "<p>in this way</p>",
        },
      ]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const palavras = await obterPalavrasOriginais(joao, 3, 16);
    expect(palavras).toHaveLength(2);
    expect(palavras[0].strong).toBe("G3779");
    expect(palavras[1].strong).toBe("G1063");
  });

  it("uma definição não encontrada (array vazio) vira null, sem quebrar as outras", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/")) {
        return respostaJson({ text: "οὕτως<S>3779</S>" });
      }
      return respostaJson([]); // bolls.life devolve [] quando não encontra
    });
    vi.stubGlobal("fetch", fetchMock);

    const palavras = await obterPalavrasOriginais(joao, 3, 16);
    expect(palavras).toEqual([
      { palavra: "οὕτως", strong: "G3779", definicao: null },
    ]);
  });

  it("retorna [] (sem lançar erro) quando a busca do versículo falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(obterPalavrasOriginais(joao, 3, 16)).resolves.toEqual([]);
  });

  it("retorna [] quando a resposta não tem nenhuma marcação de Strong", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respostaJson({ text: "texto sem marcação" })),
    );
    await expect(obterPalavrasOriginais(joao, 3, 16)).resolves.toEqual([]);
  });

  it("cacheia o versículo e a definição — uma segunda chamada não refaz nenhum fetch", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/")) {
        return respostaJson({ text: "οὕτως<S>3779</S>" });
      }
      return respostaJson([{ topic: "G3779", short_definition: "thus" }]);
    });
    vi.stubGlobal("fetch", fetchMock);

    await obterPalavrasOriginais(joao, 3, 16);
    const chamadasAntes = fetchMock.mock.calls.length;
    await obterPalavrasOriginais(joao, 3, 16);
    expect(fetchMock).toHaveBeenCalledTimes(chamadasAntes);
  });
});
