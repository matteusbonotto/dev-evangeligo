import { obterAbreviacaoLivro } from "./data/abreviacoesLivros";

/**
 * Referências cruzadas (T-050/ADR-042, item 1.4 do plano de UX) — pedido
 * explícito do usuário: "quero que passagens cruzadas tenham entre
 * parênteses as referências... em formato de link que se clicar exibe um
 * modal post-it amarelo com a passagem".
 *
 * O texto da Bíblia usado no app (`biblia-almeida.json`) NÃO tem
 * referências cruzadas embutidas — é prosa pura, verso a verso (conferido
 * lendo o arquivo antes de assumir o contrário). Os dados aqui vêm de um
 * dataset externo, verificado ao vivo nesta sessão:
 * `https://a.openbible.info/data/cross-references.zip` — derivado do
 * Treasury of Scripture Knowledge (domínio público), ~345 mil referências,
 * licença Creative Commons Atribuição (CC-BY) — crédito em
 * `LegalPage.tsx`/rodapé (ver ADR-043).
 *
 * 345 mil é demais pra mostrar tudo (poluiria o texto) — processado UMA
 * VEZ (script fora do repositório, mesmo padrão do dataset de falas de
 * Jesus em T-037/ADR-032) filtrando as 3 referências de maior "voto"
 * (relevância) por versículo, mapeando os livros para o `codigo` que
 * `LIVROS_BIBLIA` já usa. Resultado: `public/data/referencias-cruzadas.json`
 * (~1.9MB, 29319 versículos com ao menos 1 referência).
 */

export interface ReferenciaCruzada {
  livro: string;
  capituloInicio: number;
  versiculoInicio: number;
  capituloFim: number;
  versiculoFim: number;
}

/** `{ "GEN:1:1": [["JHN",1,1,1,3], ...] }` — tupla compacta pra manter o arquivo pequeno. */
type ReferenciasCruzadasData = Record<
  string,
  [string, number, number, number, number][]
>;

let cache: Promise<ReferenciasCruzadasData> | null = null;

function carregarReferenciasCruzadasData(): Promise<ReferenciasCruzadasData> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/referencias-cruzadas.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Não foi possível carregar as referências cruzadas.");
      }
      return response.json() as Promise<ReferenciasCruzadasData>;
    })
    .catch(() => ({}) as ReferenciasCruzadasData);
  return cache;
}

/** Exposto só para os testes reiniciarem o cache do módulo entre casos. */
export function _resetCacheReferenciasParaTeste(): void {
  cache = null;
}

export async function obterReferenciasCruzadas(
  livroCodigo: string,
  capitulo: number,
  versiculo: number,
): Promise<ReferenciaCruzada[]> {
  const data = await carregarReferenciasCruzadasData();
  const linhas = data[`${livroCodigo}:${capitulo}:${versiculo}`] ?? [];
  return linhas.map(
    ([livro, capituloInicio, versiculoInicio, capituloFim, versiculoFim]) => ({
      livro,
      capituloInicio,
      versiculoInicio,
      capituloFim,
      versiculoFim,
    }),
  );
}

/** "Mt 1:1" ou "Mt 1:1-5" (mesmo capítulo) ou "Mt 1:1-2:5" (capítulos diferentes). */
export function formatarReferenciaCruzada(ref: ReferenciaCruzada): string {
  const abrev = obterAbreviacaoLivro(ref.livro);
  const igual =
    ref.capituloInicio === ref.capituloFim &&
    ref.versiculoInicio === ref.versiculoFim;
  if (igual) {
    return `${abrev} ${ref.capituloInicio}:${ref.versiculoInicio}`;
  }
  if (ref.capituloInicio === ref.capituloFim) {
    return `${abrev} ${ref.capituloInicio}:${ref.versiculoInicio}-${ref.versiculoFim}`;
  }
  return `${abrev} ${ref.capituloInicio}:${ref.versiculoInicio}-${ref.capituloFim}:${ref.versiculoFim}`;
}
