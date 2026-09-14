import type { CodigoTraducao } from "./traducoes";

/** Tradução ativa persistida, global entre capítulos — mesmo padrão de `fonteLeitura.ts`. */

const CHAVE = "evangeligo:biblia:traducaoAtiva";
/** Padrão para quem nunca escolheu — pedido explícito do usuário (2026-09-14, ver ADR-034). */
const PADRAO: CodigoTraducao = "livre";
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
