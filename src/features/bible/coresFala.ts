/**
 * Preferência de "cores de fala" (red-letter Jesus / blue-letter Deus, ver
 * `data/falasEspeciais.ts`) — liga/desliga, persistida e global entre
 * capítulos, mesmo padrão de `fonteLeitura.ts`. Padrão ligado (a pessoa
 * pediu a feature; desligar é a exceção, não o contrário).
 */

const CHAVE = "evangeligo:biblia:coresFala";

export function obterPreferenciaCoresFala(): boolean {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo === null ? true : salvo === "1";
  } catch {
    return true;
  }
}

export function salvarPreferenciaCoresFala(ativo: boolean): void {
  try {
    localStorage.setItem(CHAVE, ativo ? "1" : "0");
  } catch {
    // localStorage indisponível — a preferência não persiste, leitura segue funcionando.
  }
}
