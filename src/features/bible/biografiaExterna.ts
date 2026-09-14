/**
 * Resumo biográfico ao vivo, via Wikipédia em português — pedido explícito
 * do usuário: biografias devem vir de "uma fonte segura e válida na
 * internet... mais prático, rápido, fácil e validada" em vez de conteúdo
 * escrito à mão (T-041/ADR-036). API REST oficial da Wikipédia, gratuita,
 * sem chave, CORS liberado (confirmado ao vivo antes de implementar):
 * `https://pt.wikipedia.org/api/rest_v1/page/summary/<título>`.
 *
 * `data/biografias.ts` guarda só o título exato do artigo
 * (`wikipediaTitulo`, já conferido contra a API) — o texto em si nunca é
 * embutido no app, sempre buscado ao vivo, com cache em `localStorage`
 * (conteúdo estável — um resumo de biografia não muda a cada visita).
 */

export interface ResumoBiografico {
  extrato: string;
  urlArtigo: string;
}

const URL_BASE = "https://pt.wikipedia.org/api/rest_v1/page/summary";
const TIMEOUT_MS = 7000;
const CACHE_PREFIX = "evangeligo:biblia:wikipedia:";

function chaveCache(tituloArtigo: string): string {
  return `${CACHE_PREFIX}${tituloArtigo}`;
}

function lerCache(tituloArtigo: string): ResumoBiografico | null {
  try {
    const raw = localStorage.getItem(chaveCache(tituloArtigo));
    return raw ? (JSON.parse(raw) as ResumoBiografico) : null;
  } catch {
    return null;
  }
}

function salvarCache(tituloArtigo: string, resumo: ResumoBiografico): void {
  try {
    localStorage.setItem(chaveCache(tituloArtigo), JSON.stringify(resumo));
  } catch {
    // Cache é otimização — um resumo biográfico estável não precisa persistir.
  }
}

/**
 * Busca o resumo (parágrafo introdutório) do artigo da Wikipédia em
 * português. Nunca lança erro — retorna `null` se a rede falhar ou o
 * artigo não existir; quem chama mostra só o que já tem localmente
 * (`Biografia.papel`/`referenciasBiblicasChave`) nesse caso.
 */
export async function obterResumoWikipedia(
  tituloArtigo: string,
): Promise<ResumoBiografico | null> {
  const doCache = lerCache(tituloArtigo);
  if (doCache) return doCache;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resposta = await fetch(
      `${URL_BASE}/${encodeURIComponent(tituloArtigo.replace(/ /g, "_"))}`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as {
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
    };
    if (!dados.extract) return null;
    const resumo: ResumoBiografico = {
      extrato: dados.extract,
      urlArtigo:
        dados.content_urls?.desktop?.page ??
        `https://pt.wikipedia.org/wiki/${encodeURIComponent(tituloArtigo.replace(/ /g, "_"))}`,
    };
    salvarCache(tituloArtigo, resumo);
    return resumo;
  } catch {
    return null; // rede falhou, timeout, artigo renomeado — degrada sem quebrar a tela.
  } finally {
    clearTimeout(timeout);
  }
}
