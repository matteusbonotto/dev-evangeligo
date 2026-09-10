import type { BibliaData } from "./types";

/**
 * Carregador do texto bíblico completo (T-011). O JSON (~4MB) vive em
 * `public/data/biblia-almeida.json`, fora do bundle JS — buscado sob
 * demanda (só quando o usuário abre a Bíblia) e cacheado em memória para
 * não refazer o fetch a cada navegação de capítulo. O Service Worker
 * (`vite-plugin-pwa`) faz o pré-cache deste arquivo para leitura offline
 * (RF-25) — ver `maximumFileSizeToCacheInBytes` em `vite.config.ts`.
 */
let cache: Promise<BibliaData> | null = null;

export function loadBibliaData(): Promise<BibliaData> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/biblia-almeida.json`).then((response) => {
    if (!response.ok) {
      throw new Error("Não foi possível carregar o texto bíblico.");
    }
    return response.json() as Promise<BibliaData>;
  });
  return cache;
}

/** Exposto só para os testes reiniciarem o cache do módulo entre casos. */
export function _resetCacheParaTeste(): void {
  cache = null;
}

export async function getCapituloVersiculos(
  livroOrder: number,
  capitulo: number,
): Promise<string[]> {
  const data = await loadBibliaData();
  const versiculos = data.books[String(livroOrder)]?.[capitulo - 1];
  if (!versiculos) {
    throw new Error(
      `Capítulo ${capitulo} não encontrado para o livro de ordem ${livroOrder}.`,
    );
  }
  return versiculos;
}

export async function getVersiculoTexto(
  livroOrder: number,
  capitulo: number,
  versiculo: number,
): Promise<string> {
  const versiculos = await getCapituloVersiculos(livroOrder, capitulo);
  const texto = versiculos[versiculo - 1];
  if (!texto) {
    throw new Error(
      `Versículo ${versiculo} não encontrado em ${livroOrder}:${capitulo}.`,
    );
  }
  return texto;
}
