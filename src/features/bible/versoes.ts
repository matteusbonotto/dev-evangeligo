/**
 * Dropdown de tradução (T-032 rework de fidelidade ao legado) — porta o
 * seletor visual de `traducoesBiblia` do legado (`app.js`), mas com
 * conteúdo honesto: o legado lista 3 traduções reais (ARIB/Bíblia
 * Livre/Almeida Clássica) porque migrou os 3 textos; nós só migramos um
 * (Almeida Atualizada, `public/data/biblia-almeida.json`, ver ADR-017),
 * então só uma opção é real — as demais aparecem bloqueadas
 * ("Em breve"), mesmo padrão do 4º item já bloqueado no legado, em vez
 * de fingir textos que não existem.
 */
export interface VersaoBiblia {
  valor: string;
  label: string;
  nome: string;
}

export const VERSAO_ATIVA: VersaoBiblia = {
  valor: "aa",
  label: "AA",
  nome: "Almeida Atualizada",
};

export const VERSOES_EM_BREVE: VersaoBiblia[] = [
  { valor: "arib", label: "ARIB", nome: "Almeida Imprensa Bíblica" },
  { valor: "livre", label: "BL", nome: "Bíblia Livre" },
];
