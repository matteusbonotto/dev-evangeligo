import type { Livro } from "./types";

/**
 * Significado da palavra/frase no idioma original (hebraico/aramaico ou
 * grego) — pedido explícito do usuário: "quero também a possibilidade de
 * identificar o significado da língua original da palavra ou frase, e a
 * melhor tradução do que realmente significa" (T-040/ADR-035).
 *
 * Fonte: `bolls.life`, API gratuita, sem chave, CORS liberado (confirmado
 * ao vivo antes de implementar):
 * - `get-verse/WLCa/<livro>/<capitulo>/<versiculo>/` — texto hebraico
 *   (Westminster Leningrad Codex, variante com números de Strong embutidos
 *   como `<S>NUMERO</S>` logo após cada palavra) para o Antigo Testamento.
 * - `get-verse/TISCH/<livro>/<capitulo>/<versiculo>/` — texto grego
 *   (Tischendorf), mesma marcação `<S>NUMERO</S>`, para o Novo Testamento.
 * - `dictionary-definition/BDBT/<H ou G + numero>/` — definição completa
 *   (léxico Brown-Driver-Briggs/Thayer's): lexema, transliteração,
 *   pronúncia, definição resumida e completa.
 *
 * `livro.order` já é o mesmo número de livro usado por `bolls.life`
 * (verificado ao vivo — mesma numeração canônica 1-66 já usada por
 * `traducoes.ts`/`api.getbible.net`), sem tabela de conversão nova.
 *
 * Granularidade por VERSÍCULO inteiro, não por palavra/trecho do
 * português: alinhar exatamente uma palavra do texto em português com a
 * palavra original não é confiável (traduções reordenam e reformulam a
 * frase) — em vez disso, mostra-se todo o versículo no idioma original,
 * palavra por palavra, para a pessoa encontrar a que procura.
 */

export interface DefinicaoStrong {
  strong: string;
  lexema: string;
  transliteracao: string;
  pronuncia: string;
  definicaoResumo: string;
  /** Texto simples (tags HTML da fonte já removidas) — pode ser longo. */
  definicaoCompleta: string;
}

export interface PalavraOriginal {
  /** Palavra no idioma original, como aparece no texto (pode incluir pontuação colada). */
  palavra: string;
  strong: string;
  /** `null` enquanto carrega ou se a definição não foi encontrada — nunca lança erro. */
  definicao: DefinicaoStrong | null;
}

const URL_BOLLS = "https://bolls.life";
const TIMEOUT_MS = 7000;
const CACHE_PREFIX = "evangeligo:biblia:original:";
const CACHE_STRONG_PREFIX = `${CACHE_PREFIX}strong:`;
const CACHE_VERSICULO_INDICE = `${CACHE_PREFIX}indiceVersiculo`;
const CACHE_MAX_VERSICULOS = 60;

/** Extrai `{palavra, strong}` de um texto com marcação `PALAVRA<S>NUMERO</S>`. */
function extrairPalavrasComStrong(
  texto: string,
): Array<{ palavra: string; strongBruto: string }> {
  const resultado: Array<{ palavra: string; strongBruto: string }> = [];
  const regex = /([^\s<]+)<S>(\d+)<\/S>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto))) {
    resultado.push({ palavra: match[1], strongBruto: match[2] });
  }
  return resultado;
}

/** Remove tags HTML simples (a definição do léxico vem como HTML) — texto puro para exibir. */
function removerTagsHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

function lerCacheStrong(strong: string): DefinicaoStrong | null {
  try {
    const raw = localStorage.getItem(`${CACHE_STRONG_PREFIX}${strong}`);
    return raw ? (JSON.parse(raw) as DefinicaoStrong) : null;
  } catch {
    return null;
  }
}

function salvarCacheStrong(definicao: DefinicaoStrong): void {
  try {
    localStorage.setItem(
      `${CACHE_STRONG_PREFIX}${definicao.strong}`,
      JSON.stringify(definicao),
    );
  } catch {
    // Definições de Strong nunca mudam — cache é só otimização, não essencial.
  }
}

/** Busca a definição de UM número de Strong (ex.: "H7225", "G26"). Nunca lança erro. */
async function obterDefinicaoStrong(
  strong: string,
): Promise<DefinicaoStrong | null> {
  const doCache = lerCacheStrong(strong);
  if (doCache) return doCache;

  try {
    const dados = (await buscarJson(
      `${URL_BOLLS}/dictionary-definition/BDBT/${strong}/`,
    )) as Array<{
      topic?: string;
      definition?: string;
      lexeme?: string;
      transliteration?: string;
      pronunciation?: string;
      short_definition?: string;
    }>;
    const primeira = dados?.[0];
    if (!primeira) return null;
    const definicao: DefinicaoStrong = {
      strong,
      lexema: primeira.lexeme ?? "",
      transliteracao: primeira.transliteration ?? "",
      pronuncia: primeira.pronunciation ?? "",
      definicaoResumo: primeira.short_definition ?? "",
      definicaoCompleta: removerTagsHtml(primeira.definition ?? ""),
    };
    salvarCacheStrong(definicao);
    return definicao;
  } catch {
    return null; // rede falhou — a palavra ainda aparece, só sem definição.
  }
}

function chaveCacheVersiculo(
  codigoLivro: string,
  capitulo: number,
  versiculo: number,
): string {
  return `${CACHE_PREFIX}versiculo:${codigoLivro}:${capitulo}:${versiculo}`;
}

function lerCacheVersiculo(
  codigoLivro: string,
  capitulo: number,
  versiculo: number,
): Array<{ palavra: string; strongBruto: string }> | null {
  try {
    const raw = localStorage.getItem(
      chaveCacheVersiculo(codigoLivro, capitulo, versiculo),
    );
    return raw
      ? (JSON.parse(raw) as Array<{ palavra: string; strongBruto: string }>)
      : null;
  } catch {
    return null;
  }
}

function salvarCacheVersiculo(
  codigoLivro: string,
  capitulo: number,
  versiculo: number,
  palavras: Array<{ palavra: string; strongBruto: string }>,
): void {
  try {
    const chave = chaveCacheVersiculo(codigoLivro, capitulo, versiculo);
    localStorage.setItem(chave, JSON.stringify(palavras));
    const anterior = JSON.parse(
      localStorage.getItem(CACHE_VERSICULO_INDICE) ?? "[]",
    ) as string[];
    const indice = [chave, ...anterior.filter((item) => item !== chave)];
    for (const chaveAntiga of indice.slice(CACHE_MAX_VERSICULOS)) {
      localStorage.removeItem(chaveAntiga);
    }
    localStorage.setItem(
      CACHE_VERSICULO_INDICE,
      JSON.stringify(indice.slice(0, CACHE_MAX_VERSICULOS)),
    );
  } catch {
    // Cache é otimização — nunca pode impedir o recurso de funcionar.
  }
}

/**
 * Busca as palavras originais (hebraico ou grego) do versículo, cada uma já
 * com a definição de Strong completa carregada. Nunca lança erro — em
 * falha total (rede indisponível, versículo sem marcação), retorna `[]` e
 * quem chama mostra "indisponível" em vez de quebrar a tela.
 */
export async function obterPalavrasOriginais(
  livro: Livro,
  capitulo: number,
  versiculo: number,
): Promise<PalavraOriginal[]> {
  const prefixoStrong = livro.testamento === "AT" ? "H" : "G";
  const traducaoOriginal = livro.testamento === "AT" ? "WLCa" : "TISCH";

  let brutas = lerCacheVersiculo(livro.codigo, capitulo, versiculo);
  if (!brutas) {
    try {
      const dados = (await buscarJson(
        `${URL_BOLLS}/get-verse/${traducaoOriginal}/${livro.order}/${capitulo}/${versiculo}/`,
      )) as { text?: string } | null;
      brutas = extrairPalavrasComStrong(dados?.text ?? "");
      if (brutas.length > 0) {
        salvarCacheVersiculo(livro.codigo, capitulo, versiculo, brutas);
      }
    } catch {
      return [];
    }
  }
  if (!brutas || brutas.length === 0) return [];

  const strongsUnicos = Array.from(
    new Set(brutas.map((p) => `${prefixoStrong}${p.strongBruto}`)),
  );
  const definicoesPorStrong = new Map<string, DefinicaoStrong | null>();
  await Promise.all(
    strongsUnicos.map(async (strong) => {
      definicoesPorStrong.set(strong, await obterDefinicaoStrong(strong));
    }),
  );

  return brutas.map(({ palavra, strongBruto }) => {
    const strong = `${prefixoStrong}${strongBruto}`;
    return {
      palavra,
      strong,
      definicao: definicoesPorStrong.get(strong) ?? null,
    };
  });
}
