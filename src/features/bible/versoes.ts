import type { CodigoTraducao } from "./traducoes";

/**
 * Dropdown de tradução — 3 traduções reais, migradas do legado (pedido
 * explícito do usuário: "quero acesso a outras bíblias... verifique como
 * estava no legado, e aplique as mesmas, pois elas funcionavam umas 3").
 * Substitui a versão anterior desta rodada (T-032/ADR-027), que só tinha
 * 1 tradução real (`aa`, arquivo local) e 2 bloqueadas "em breve" — agora
 * `arib`/`livre` buscam ao vivo de verdade (`traducoes.ts`), mesmas
 * fontes/URLs do legado (`bible-api.com`/`api.getbible.net`).
 */
export interface VersaoBiblia {
  valor: CodigoTraducao;
  label: string;
  nome: string;
}

export const TRADUCOES_BIBLIA: VersaoBiblia[] = [
  { valor: "aa", label: "AA", nome: "Almeida Atualizada" },
  { valor: "arib", label: "ARIB", nome: "Almeida Imprensa Bíblica" },
  { valor: "livre", label: "BL", nome: "Bíblia Livre" },
];

/** Pedido explícito do usuário (2026-09-14, ver ADR-034). */
export const TRADUCAO_PADRAO: CodigoTraducao = "livre";
