import { beforeEach, describe, expect, it, vi } from "vitest";
import { obterResumoWikipedia } from "./biografiaExterna";

function respostaJson(corpo: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(corpo) });
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("obterResumoWikipedia", () => {
  it("busca o resumo na API da Wikipédia em português", async () => {
    const fetchMock = vi.fn((url: string) => {
      expect(url).toBe(
        "https://pt.wikipedia.org/api/rest_v1/page/summary/Pedro_(ap%C3%B3stolo)",
      );
      return respostaJson({
        extract: "Simão Pedro foi um dos doze apóstolos de Jesus Cristo.",
        content_urls: {
          desktop: {
            page: "https://pt.wikipedia.org/wiki/Pedro_(ap%C3%B3stolo)",
          },
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(obterResumoWikipedia("Pedro (apóstolo)")).resolves.toEqual({
      extrato: "Simão Pedro foi um dos doze apóstolos de Jesus Cristo.",
      urlArtigo: "https://pt.wikipedia.org/wiki/Pedro_(ap%C3%B3stolo)",
    });
  });

  it("retorna null (sem lançar erro) quando a rede falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(obterResumoWikipedia("Pedro (apóstolo)")).resolves.toBeNull();
  });

  it("retorna null quando o artigo não existe (404)", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, json: () => Promise.resolve(null) }),
    );
    await expect(
      obterResumoWikipedia("Artigo Inexistente"),
    ).resolves.toBeNull();
  });

  it("cacheia o resultado — uma segunda chamada não refaz o fetch", async () => {
    const fetchMock = vi.fn(() =>
      respostaJson({
        extract: "Texto.",
        content_urls: { desktop: { page: "https://x" } },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await obterResumoWikipedia("Davi");
    await obterResumoWikipedia("Davi");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
