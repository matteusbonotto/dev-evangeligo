/**
 * Tamanho de fonte da leitura (T-032 rework de fidelidade ao legado) —
 * porta `aumentarFonte`/`diminuirFonte` de `app.js`: 0.7rem a 2.0rem,
 * passo de 0.15rem, aplicado como `font-size` inline no container do
 * texto (não uma classe/token CSS — o valor é contínuo, não uma escala
 * discreta), persistido e global entre capítulos.
 */

export const FONTE_LEITURA_MIN = 0.7;
export const FONTE_LEITURA_MAX = 2;
export const FONTE_LEITURA_PASSO = 0.15;
const FONTE_LEITURA_PADRAO = 1;

const CHAVE = "evangeligo:biblia:fonte";

export function ajustarFonteLeitura(atual: number, delta: number): number {
  const proxima = parseFloat((atual + delta).toFixed(2));
  return Math.min(FONTE_LEITURA_MAX, Math.max(FONTE_LEITURA_MIN, proxima));
}

export function obterFonteLeituraSalva(): number {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? parseFloat(salvo) : FONTE_LEITURA_PADRAO;
  } catch {
    return FONTE_LEITURA_PADRAO;
  }
}

export function salvarFonteLeitura(valor: number): void {
  try {
    localStorage.setItem(CHAVE, String(valor));
  } catch {
    // localStorage indisponível — a preferência não persiste, leitura segue funcionando.
  }
}
