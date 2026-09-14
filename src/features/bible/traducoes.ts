import type { Livro } from "./types";
import { getCapituloVersiculos } from "./dataLoader";

/**
 * Cliente de leitura multi-tradução (pedido explícito do usuário: "quero
 * acesso a outras bíblias também gratuitas... verifique como estava no
 * legado, e aplique as mesmas"). Porta `apiBiblia.js` do app legado
 * (`dev-pwa-biblia-game/public/game/assets/js/api/apiBiblia.js`) — MESMAS
 * 3 traduções, MESMAS fontes/URLs, MESMA cadeia de fallback:
 *
 * - `aa` ("Almeida Atualizada"): a única tradução já migrada como arquivo
 *   local (`public/data/biblia-almeida.json`, T-011/ADR-017) — pré-cacheada
 *   pelo Service Worker para leitura offline, sem rede nenhuma. Continua
 *   sendo o caminho padrão/mais rápido; não passa pela busca ao vivo nem
 *   pelo cache de `localStorage` abaixo.
 * - `arib` ("Almeida Imprensa Bíblica"): busca ao vivo em `bible-api.com`
 *   (fallback: `api.getbible.net/v2/almeida`).
 * - `livre` ("Bíblia Livre"): busca ao vivo em `api.getbible.net/v2/livre`
 *   (fallback: `api.getbible.net/v2/livretr`).
 *
 * As duas traduções ao vivo dependem de rede (diferente da `aa` local) —
 * por isso ficam em cache de capítulo em `localStorage` (mesma técnica do
 * legado: até 40 capítulos, LRU simples por índice) para não refazer o
 * fetch a cada vez que a pessoa volta ao mesmo capítulo, e caem para a
 * tradução local (`aa`) como último recurso se as duas fontes de rede
 * falharem — a leitura nunca fica sem texto nenhum, só eventualmente sem
 * a tradução exata que a pessoa escolheu.
 */

export type CodigoTraducao = "aa" | "arib" | "livre";

const URL_BIBLE_API = "https://bible-api.com";
const URL_GETBIBLE = "https://api.getbible.net/v2";
const TIMEOUT_MS = 7000;
const CACHE_PREFIX = "evangeligo:biblia:traducao:";
const CACHE_INDICE = `${CACHE_PREFIX}indice`;
const CACHE_MAX_CAPITULOS = 40;

function respostaValida(versiculos: unknown): versiculos is string[] {
  return (
    Array.isArray(versiculos) &&
    versiculos.length > 0 &&
    versiculos.every((v) => typeof v === "string" && v.trim().length > 0)
  );
}

function chaveCache(
  codigoLivro: string,
  capitulo: number,
  traducao: CodigoTraducao,
): string {
  return `${CACHE_PREFIX}${traducao}:${codigoLivro}:${capitulo}`;
}

function lerCache(
  codigoLivro: string,
  capitulo: number,
  traducao: CodigoTraducao,
): string[] | null {
  try {
    const raw = localStorage.getItem(
      chaveCache(codigoLivro, capitulo, traducao),
    );
    if (!raw) return null;
    const dados = JSON.parse(raw) as unknown;
    return respostaValida(dados) ? dados : null;
  } catch {
    return null;
  }
}

function salvarCache(
  codigoLivro: string,
  capitulo: number,
  traducao: CodigoTraducao,
  versiculos: string[],
): void {
  if (!respostaValida(versiculos)) return;
  try {
    const chave = chaveCache(codigoLivro, capitulo, traducao);
    localStorage.setItem(chave, JSON.stringify(versiculos));
    const anterior = JSON.parse(
      localStorage.getItem(CACHE_INDICE) ?? "[]",
    ) as string[];
    const indice = [chave, ...anterior.filter((item) => item !== chave)];
    for (const chaveAntiga of indice.slice(CACHE_MAX_CAPITULOS)) {
      localStorage.removeItem(chaveAntiga);
    }
    localStorage.setItem(
      CACHE_INDICE,
      JSON.stringify(indice.slice(0, CACHE_MAX_CAPITULOS)),
    );
  } catch {
    // Falta de espaço no cache nunca pode impedir a leitura.
  }
}

async function buscarJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resposta = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Formato comum a `bible-api.com` e `api.getbible.net`: uma lista de versículos com número + texto. */
function extrairVersiculos(dados: unknown): string[] | null {
  const lista = (dados as { verses?: unknown } | null)?.verses;
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const porNumero = new Map<number, string>();
  for (const item of lista as Array<{ verse?: unknown; text?: unknown }>) {
    const numero = Number(item?.verse);
    const texto = String(item?.text ?? "").trim();
    if (Number.isFinite(numero) && texto) porNumero.set(numero, texto);
  }
  if (porNumero.size === 0) return null;
  const max = Math.max(...porNumero.keys());
  const versiculos: string[] = [];
  for (let numero = 1; numero <= max; numero += 1) {
    const texto = porNumero.get(numero);
    if (!texto) return null; // buraco na sequência — resposta incompleta, não usar.
    versiculos.push(texto);
  }
  return versiculos;
}

async function obterDoBibleApi(
  codigoLivro: string,
  capitulo: number,
): Promise<string[] | null> {
  const url = `${URL_BIBLE_API}/data/almeida/${codigoLivro}/${capitulo}`;
  return extrairVersiculos(await buscarJson(url));
}

async function obterDoGetBible(
  numeroLivro: number,
  capitulo: number,
  traducaoGetBible: string,
): Promise<string[] | null> {
  const url = `${URL_GETBIBLE}/${traducaoGetBible}/${numeroLivro}/${capitulo}.json`;
  return extrairVersiculos(await buscarJson(url));
}

/**
 * Busca o capítulo na tradução escolhida. `aa` usa o arquivo local
 * (rápido, offline); `arib`/`livre` buscam ao vivo com fallback entre 2
 * fontes cada (mesma ordem do legado) e caem para `aa` local como último
 * recurso se as duas falharem — nunca lança erro para o chamador.
 */
export async function obterCapituloTraduzido(
  livro: Livro,
  capitulo: number,
  traducao: CodigoTraducao,
): Promise<string[]> {
  if (traducao === "aa") {
    return getCapituloVersiculos(livro.order, capitulo);
  }

  const cache = lerCache(livro.codigo, capitulo, traducao);
  if (cache) return cache;

  const fontes: Array<() => Promise<string[] | null>> =
    traducao === "livre"
      ? [
          () => obterDoGetBible(livro.order, capitulo, "livre"),
          () => obterDoGetBible(livro.order, capitulo, "livretr"),
        ]
      : [
          () => obterDoBibleApi(livro.codigo, capitulo),
          () => obterDoGetBible(livro.order, capitulo, "almeida"),
        ];

  for (const carregar of fontes) {
    try {
      const versiculos = await carregar();
      if (versiculos) {
        salvarCache(livro.codigo, capitulo, traducao, versiculos);
        return versiculos;
      }
    } catch {
      // Falha de rede é esperada (offline, timeout, fonte fora do ar) — tenta a próxima fonte.
    }
  }

  // Última tentativa: texto local (Almeida Atualizada) — a leitura nunca
  // fica sem texto nenhum, mesmo que as 2 fontes de rede da tradução
  // escolhida falhem (ex.: sem internet).
  return getCapituloVersiculos(livro.order, capitulo);
}
