/**
 * Utilitários de texto compartilhados pelos exercícios de palavras (T-034:
 * caça-palavras, termo), migrados de `dev-pwa-biblia-game/public/game/
 * assets/js/app.js` (`normalizarPalavra`/`embaralharLista`).
 */

/** Remove acentos, mantém só letras A-Z, deixa maiúsculo — para comparar palavras ignorando acentuação. */
export function normalizarPalavra(valor = ""): string {
  // NFD decompõe "É" em "E" + acento combinável separado; o filtro
  // [^A-Za-z] descarta o acento (e qualquer outro não-letra) na sequência.
  return valor
    .normalize("NFD")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
}

/** Fisher-Yates. `random` injetável (padrão `Math.random`) para testes determinísticos. */
export function embaralharLista<T>(
  lista: readonly T[],
  random: () => number = Math.random,
): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
