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
 *
 * Definições traduzidas pro PT-BR (Fase 4 do plano de UX, item 2/7 do
 * feedback: "os significados... devem estar em português, não em
 * inglês") via `api.mymemory.translated.net` — gratuita, sem chave,
 * testada ao vivo antes de usar. Falha de tradução nunca quebra a tela:
 * devolve o texto original em inglês em vez de lançar erro. Traduzido
 * uma vez e cacheado junto da definição (Strong nunca muda), então o
 * custo de tradução só existe na primeira vez que cada número aparece.
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
const URL_MYMEMORY = "https://api.mymemory.translated.net/get";
const TIMEOUT_MS = 7000;
/** 2ª tentativa com timeout maior — bolls.life falha esporadicamente por lentidão, não só rede fora do ar. */
const TIMEOUT_MS_RETRY = 12000;
const CACHE_PREFIX = "evangeligo:biblia:original:";
/**
 * Prefixo com versão (`strongV2`, não `strong`) de propósito: antes da
 * tradução pro PT-BR (T-056), este cache já guardava definições em
 * inglês há sessões — sem versionar a chave, quem já tinha uma palavra
 * cacheada continuaria vendo o inglês antigo pra sempre (`lerCacheStrong`
 * nunca refaz o fetch se já existe cache), mesmo depois do código
 * traduzir tudo de novo. Bug real reportado pelo usuário: "a tradução...
 * está em inglês" — a chave nova invalida o cache velho de uma vez.
 */
const CACHE_STRONG_PREFIX = `${CACHE_PREFIX}strongV2:`;
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

/**
 * Remove o cabeçalho ("Original: <hebraico/grego> Transliteration: ...
 * Phonetic: ... [BDB ]Definition:") e o rodapé ("Origin: ... TWOT/TDNT
 * entry: ... Part(s) of speech: ...") da definição bruta do bolls.life
 * antes de traduzir — achado real ao investigar por que a tradução
 * continuava em inglês mesmo depois de integrar `api.mymemory.
 * translated.net`: o cabeçalho tem caractere hebraico/grego misturado
 * com rótulos em inglês, e o MyMemory simplesmente devolve o texto quase
 * sem tradução nenhuma pra esse tipo de entrada "não natural" (testado ao
 * vivo). Sem esse cabeçalho/rodapé — que já é redundante, pois
 * lexema/transliteração/pronúncia aparecem em campos próprios — a
 * tradução funciona perfeitamente. Nunca lança erro: se os marcadores não
 * aparecem (formato inesperado), devolve o texto original sem cortar nada.
 */
function limparDefinicaoParaTraducao(textoCompleto: string): string {
  const semCabecalho = textoCompleto.replace(/^.*?Definition:\s*/i, "");
  const [semRodape] = semCabecalho.split(/\bOrigin:/i);
  return semRodape.trim() || textoCompleto;
}

async function buscarJsonUmaVez(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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

/** 1 nova tentativa com timeout maior antes de desistir — só lança erro se as duas falharem. */
async function buscarJson(url: string): Promise<unknown> {
  try {
    return await buscarJsonUmaVez(url, TIMEOUT_MS);
  } catch {
    return buscarJsonUmaVez(url, TIMEOUT_MS_RETRY);
  }
}

/** Traduz um texto curto do inglês pro português — nunca lança erro: falha vira o texto original em inglês. */
async function traduzirParaPtBr(textoIngles: string): Promise<string> {
  const texto = textoIngles.trim();
  if (!texto) return texto;
  try {
    const url = `${URL_MYMEMORY}?q=${encodeURIComponent(texto.slice(0, 480))}&langpair=en|pt-BR`;
    const dados = (await buscarJson(url)) as {
      responseData?: { translatedText?: string };
    };
    const traduzido = dados?.responseData?.translatedText?.trim();
    return traduzido || texto;
  } catch {
    return texto;
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
    const definicaoLimpa = limparDefinicaoParaTraducao(
      removerTagsHtml(primeira.definition ?? ""),
    );
    const [definicaoResumo, definicaoCompleta] = await Promise.all([
      traduzirParaPtBr(primeira.short_definition ?? ""),
      traduzirParaPtBr(definicaoLimpa),
    ]);
    const definicao: DefinicaoStrong = {
      strong,
      lexema: primeira.lexeme ?? "",
      transliteracao: primeira.transliteration ?? "",
      pronuncia: primeira.pronunciation ?? "",
      definicaoResumo,
      definicaoCompleta,
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

/**
 * Bug real reportado pelo usuário (2026-09-16): selecionar 1 palavra em
 * português sempre devolvia TODAS as palavras do versículo original pra
 * remexer — "muito mal implementado". A limitação de fundo continua real
 * (tradução reordena/reformula a frase, não dá pra alinhar com certeza
 * absoluta), mas dava pra fazer bem melhor que "sempre mostra tudo":
 * localiza em que POSIÇÃO (por palavra, não caractere) o trecho
 * selecionado cai dentro do versículo em português, e usa a MESMA posição
 * proporcional dentro da lista de palavras originais — hebraico/grego
 * raramente inverte a ordem geral da frase numa tradução formal como a
 * Almeida, então a vizinhança proporcional costuma acertar a palavra
 * certa (ou ficar bem perto dela), o que já é muito melhor que devolver
 * o versículo inteiro pra 1 palavra selecionada.
 */
export interface IntervaloDePalavras {
  indiceInicio: number;
  indiceFim: number;
  totalPalavras: number;
}

/** Conta em que índice de PALAVRA (não caractere) os offsets `inicio`/`fim` caem dentro do texto completo. */
export function calcularIntervaloDePalavras(
  textoCompleto: string,
  inicio: number,
  fim: number,
): IntervaloDePalavras {
  const palavras = textoCompleto.split(/\s+/).filter(Boolean);
  if (palavras.length === 0 || fim <= inicio) {
    return { indiceInicio: 0, indiceFim: 0, totalPalavras: palavras.length };
  }

  let cursor = 0;
  let indiceInicio = palavras.length;
  let indiceFim = palavras.length;
  for (let i = 0; i < palavras.length; i++) {
    const inicioPalavra = textoCompleto.indexOf(palavras[i], cursor);
    const fimPalavra = inicioPalavra + palavras[i].length;
    if (indiceInicio === palavras.length && fimPalavra > inicio) {
      indiceInicio = i;
    }
    if (inicioPalavra < fim) {
      indiceFim = i + 1;
    }
    cursor = fimPalavra;
  }
  return { indiceInicio, indiceFim: Math.max(indiceFim, indiceInicio + 1), totalPalavras: palavras.length };
}

/**
 * Aplica a MESMA posição proporcional do intervalo em português na lista
 * de palavras originais — sempre devolve ao menos 1 palavra. Nunca lança
 * erro: entradas degeneradas (0 palavras em algum dos lados) devolvem a
 * lista inteira, que é o comportamento anterior (melhor que devolver
 * vazio).
 */
export function filtrarPalavrasPelaSelecao(
  palavras: PalavraOriginal[],
  intervaloPt: IntervaloDePalavras,
): PalavraOriginal[] {
  if (palavras.length === 0 || intervaloPt.totalPalavras === 0) return palavras;

  const proporcaoInicio = intervaloPt.indiceInicio / intervaloPt.totalPalavras;
  const proporcaoFim = intervaloPt.indiceFim / intervaloPt.totalPalavras;
  const indiceInicio = Math.min(
    palavras.length - 1,
    Math.floor(proporcaoInicio * palavras.length),
  );
  const indiceFim = Math.max(
    indiceInicio + 1,
    Math.min(palavras.length, Math.ceil(proporcaoFim * palavras.length)),
  );
  return palavras.slice(indiceInicio, indiceFim);
}
