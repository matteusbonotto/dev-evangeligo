/**
 * Narração por voz do capítulo (T-032 rework de fidelidade ao legado) —
 * porta `narrarCapitulo`/`pararNarracao`/`aumentarVelocidade`/
 * `diminuirVelocidade` de `app.js`: uma fila de utterances (uma por
 * versículo, "Versículo N. <texto>", mais um preâmbulo "<Livro>
 * capítulo <N>."), falada sequencialmente via Web Speech API
 * (`window.speechSynthesis`), `pt-BR`, velocidade ajustável.
 *
 * Só a parte PURA (sem `window`/`SpeechSynthesisUtterance`) vive aqui,
 * para ficar testável com Vitest — o hook que de fato aciona a API do
 * navegador fica em `useNarracaoBiblia.ts` (depende de React + browser).
 */

export const NARRACAO_VELOCIDADE_MIN = 0.25;
export const NARRACAO_VELOCIDADE_MAX = 3;
export const NARRACAO_VELOCIDADE_PASSO = 0.25;
const NARRACAO_VELOCIDADE_PADRAO = 1;

const CHAVE_VELOCIDADE = "evangeligo:biblia:narracao-velocidade";

/** Monta a fila de textos a serem falados: preâmbulo + um item por versículo. */
export function montarFilaNarracao(
  nomeLivro: string,
  capitulo: number,
  versiculos: readonly string[],
): string[] {
  return [
    `${nomeLivro} capítulo ${capitulo}.`,
    ...versiculos.map((texto, index) => `Versículo ${index + 1}. ${texto}`),
  ];
}

export function ajustarVelocidadeNarracao(atual: number, delta: number): number {
  const proxima = parseFloat((atual + delta).toFixed(2));
  return Math.min(
    NARRACAO_VELOCIDADE_MAX,
    Math.max(NARRACAO_VELOCIDADE_MIN, proxima),
  );
}

export function obterVelocidadeNarracaoSalva(): number {
  try {
    const salvo = localStorage.getItem(CHAVE_VELOCIDADE);
    return salvo ? parseFloat(salvo) : NARRACAO_VELOCIDADE_PADRAO;
  } catch {
    return NARRACAO_VELOCIDADE_PADRAO;
  }
}

export function salvarVelocidadeNarracao(valor: number): void {
  try {
    localStorage.setItem(CHAVE_VELOCIDADE, String(valor));
  } catch {
    // localStorage indisponível — a preferência não persiste, narração segue funcionando.
  }
}
