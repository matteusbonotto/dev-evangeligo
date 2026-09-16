import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calcularIntervaloDePalavras,
  filtrarPalavrasPelaSelecao,
  obterPalavrasOriginais,
  type PalavraOriginal,
} from "./linguaOriginal";
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

/** Mock da tradução: devolve o texto original prefixado, só pra provar que passou pela tradução. */
function respostaTraducao(url: string) {
  const q = decodeURIComponent(new URL(url).searchParams.get("q") ?? "");
  return respostaJson({ responseData: { translatedText: `[PT] ${q}` } });
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
      if (url.includes("mymemory.translated.net")) {
        return respostaTraducao(url);
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
          definicaoResumo: "[PT] beginning",
          definicaoCompleta: "[PT] first, beginning",
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
          definicaoResumo: "[PT] create",
          definicaoCompleta: "[PT] to create",
        },
      },
    ]);
  });
});

describe("tradução remove o cabeçalho/rodapé em hebraico/grego antes de mandar pro tradutor", () => {
  it("bug real: cabeçalho 'Original: <hebraico> Transliteration: ... Definition:' e rodapé 'Origin: ...' nunca vão pro texto traduzido", async () => {
    const urlsTraduzidas: string[] = [];
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/WLCa/1/1/1/")) {
        return respostaJson({ text: "בְּרֵאשִׁית<S>7225</S>" });
      }
      if (url.includes("dictionary-definition/BDBT/H7225")) {
        return respostaJson([
          {
            topic: "H7225",
            lexeme: "רֵאשִׁית",
            transliteration: "rêʼshîyth",
            pronunciation: "ray-sheeth",
            short_definition: "beginning",
            definition:
              "Original: <b><he>ראשית</he></b> Transliteration: <b>reshiyth</b> Phonetic: <b>ray-sheeth</b> BDB Definition:first, beginning Origin: from H7221 TWOT entry: 2097a Part(s) of speech: Noun Feminine",
          },
        ]);
      }
      if (url.includes("mymemory.translated.net")) {
        urlsTraduzidas.push(url);
        return respostaTraducao(url);
      }
      throw new Error(`URL inesperada: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const [{ definicao }] = await obterPalavrasOriginais(genesis, 1, 1);

    const textosEnviados = urlsTraduzidas.map((url) =>
      decodeURIComponent(new URL(url).searchParams.get("q") ?? ""),
    );
    expect(textosEnviados).toContain("first, beginning");
    for (const texto of textosEnviados) {
      expect(texto).not.toContain("Original:");
      expect(texto).not.toContain("Origin:");
    }
    expect(definicao?.definicaoCompleta).toBe("[PT] first, beginning");
  });
});

describe("obterPalavrasOriginais — Novo Testamento (grego, TISCH)", () => {
  it("extrai palavra e número de Strong (prefixo G)", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/get-verse/TISCH/43/3/16/")) {
        expect(url).toBe("https://bolls.life/get-verse/TISCH/43/3/16/");
        return respostaJson({ text: "οὕτως<S>3779</S> γὰρ<S>1063</S>" });
      }
      if (url.includes("mymemory.translated.net")) {
        return respostaTraducao(url);
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

/**
 * T-068 — bug real: selecionar 1 palavra em português sempre devolvia
 * TODAS as palavras do versículo original. `calcularIntervaloDePalavras` +
 * `filtrarPalavrasPelaSelecao` recortam pela posição proporcional.
 */
describe("calcularIntervaloDePalavras", () => {
  const texto = "no princípio criou Deus os céus e a terra";
  // índices:      0    1        2     3   4    5   6 7   8

  it("acha o índice de 1 única palavra selecionada", () => {
    const inicio = texto.indexOf("Deus");
    const fim = inicio + "Deus".length;
    expect(calcularIntervaloDePalavras(texto, inicio, fim)).toEqual({
      indiceInicio: 3,
      indiceFim: 4,
      totalPalavras: 9,
    });
  });

  it("acha o intervalo de uma frase selecionada (várias palavras)", () => {
    const inicio = texto.indexOf("céus");
    const fim = texto.indexOf("terra") + "terra".length;
    const resultado = calcularIntervaloDePalavras(texto, inicio, fim);
    expect(resultado.indiceInicio).toBe(5);
    expect(resultado.indiceFim).toBe(9);
    expect(resultado.totalPalavras).toBe(9);
  });

  it("nunca lança erro com um intervalo vazio/degenerado", () => {
    expect(calcularIntervaloDePalavras(texto, 5, 5)).toEqual({
      indiceInicio: 0,
      indiceFim: 0,
      totalPalavras: 9,
    });
    expect(calcularIntervaloDePalavras("", 0, 0)).toEqual({
      indiceInicio: 0,
      indiceFim: 0,
      totalPalavras: 0,
    });
  });
});

describe("filtrarPalavrasPelaSelecao", () => {
  function palavra(texto: string): PalavraOriginal {
    return { palavra: texto, strong: "H0", definicao: null };
  }

  const palavrasOriginais = [
    palavra("א"),
    palavra("ב"),
    palavra("ג"),
    palavra("ד"),
    palavra("ה"),
    palavra("ו"),
    palavra("ז"),
    palavra("ח"),
  ]; // 8 palavras, mesmo total do exemplo em português acima

  it("recorta só a palavra na mesma posição proporcional (1 palavra selecionada)", () => {
    const intervalo = { indiceInicio: 2, indiceFim: 3, totalPalavras: 8 };
    const resultado = filtrarPalavrasPelaSelecao(palavrasOriginais, intervalo);
    expect(resultado).toEqual([palavra("ג")]);
  });

  it("recorta o trecho proporcional quando uma frase inteira foi selecionada", () => {
    const intervalo = { indiceInicio: 4, indiceFim: 8, totalPalavras: 8 };
    const resultado = filtrarPalavrasPelaSelecao(palavrasOriginais, intervalo);
    expect(resultado).toEqual([palavra("ה"), palavra("ו"), palavra("ז"), palavra("ח")]);
  });

  it("nunca devolve uma lista vazia — sempre pelo menos 1 palavra", () => {
    const intervalo = { indiceInicio: 0, indiceFim: 0, totalPalavras: 8 };
    const resultado = filtrarPalavrasPelaSelecao(palavrasOriginais, intervalo);
    expect(resultado.length).toBeGreaterThanOrEqual(1);
  });

  it("devolve a lista inteira se o total de palavras em português for 0 (nunca quebra)", () => {
    const intervalo = { indiceInicio: 0, indiceFim: 0, totalPalavras: 0 };
    expect(filtrarPalavrasPelaSelecao(palavrasOriginais, intervalo)).toEqual(
      palavrasOriginais,
    );
  });
});
