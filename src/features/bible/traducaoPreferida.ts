import type { CodigoTraducao } from "./traducoes";

/** Tradução ativa persistida, global entre capítulos — mesmo padrão de `fonteLeitura.ts`. */

const CHAVE = "evangeligo:biblia:traducaoAtiva";
const PADRAO: CodigoTraducao = "aa";
const VALIDAS: CodigoTraducao[] = ["aa", "arib", "livre"];

export function obterTraducaoPreferida(): CodigoTraducao {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return VALIDAS.includes(salvo as CodigoTraducao)
      ? (salvo as CodigoTraducao)
      : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function salvarTraducaoPreferida(traducao: CodigoTraducao): void {
  try {
    localStorage.setItem(CHAVE, traducao);
  } catch {
    // localStorage indisponível — a preferência não persiste, leitura segue funcionando.
  }
}
