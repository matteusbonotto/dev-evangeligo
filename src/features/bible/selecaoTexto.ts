/**
 * Seleção de texto por toque + pinos arrastáveis (T-032 rework de
 * fidelidade ao legado) — porta `iniciarSelecaoBiblia`/`_moverPin` de
 * `app.js`: tocar numa palavra expande a seleção para ela inteira e
 * mostra dois pinos (início/fim) arrastáveis independentemente; a
 * seleção nativa do navegador fica desativada (`user-select: none`) —
 * o legado não usa `window.getSelection()` para nada na Bíblia, só os
 * pinos custom, porque eles funcionam de forma previsível tanto em
 * mouse quanto em toque.
 *
 * Só a expansão de palavra (pura, testável) vive aqui — o resto
 * (posição na tela via `caretRangeFromPoint`, arrastar via Pointer
 * Events) depende do DOM real e vive em `LeituraPage.tsx`.
 */

/** Letra ou dígito, unicode — cobre acentuação do português (á, ç, ã...). */
const CARACTERE_DE_PALAVRA = /[\p{L}\p{N}]/u;

/**
 * Expande um offset de clique para os limites da palavra mais próxima.
 * Se o clique caiu em cima de um espaço/pontuação, procura a letra mais
 * próxima nos dois sentidos antes de expandir.
 */
export function expandirParaPalavra(
  texto: string,
  offset: number,
): { inicio: number; fim: number } {
  if (!texto.length) return { inicio: 0, fim: 0 };
  let ancora = Math.min(Math.max(offset, 0), texto.length - 1);

  if (!CARACTERE_DE_PALAVRA.test(texto[ancora])) {
    let esquerda = ancora - 1;
    let direita = ancora + 1;
    let achou = false;
    while (esquerda >= 0 || direita < texto.length) {
      if (esquerda >= 0 && CARACTERE_DE_PALAVRA.test(texto[esquerda])) {
        ancora = esquerda;
        achou = true;
        break;
      }
      if (direita < texto.length && CARACTERE_DE_PALAVRA.test(texto[direita])) {
        ancora = direita;
        achou = true;
        break;
      }
      esquerda--;
      direita++;
    }
    if (!achou) return { inicio: offset, fim: offset };
  }

  let inicio = ancora;
  while (inicio > 0 && CARACTERE_DE_PALAVRA.test(texto[inicio - 1])) inicio--;
  let fim = ancora + 1;
  while (fim < texto.length && CARACTERE_DE_PALAVRA.test(texto[fim])) fim++;
  return { inicio, fim };
}
