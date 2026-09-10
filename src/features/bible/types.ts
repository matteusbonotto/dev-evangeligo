/**
 * Tipos do domínio da Bíblia (T-011, RF-09). O texto em si não é migrado
 * como código — vive em `public/data/biblia-almeida.json` (fetch lazy, ver
 * `dataLoader.ts`) para não inflar o bundle JS principal. Ver
 * `IA/memory/decisions.md` ADR-017 para a decisão de licenciamento
 * (migrado com aviso de "validação pendente", por pedido explícito do
 * usuário).
 */

export type Testamento = "AT" | "NT";

/** Categoria temática (Lei, Históricos, Sabedoria...), migrada do legado (`livrosBiblia.js`, `GRUPOS_BIBLIA`). */
export type Grupo =
  | "lei"
  | "historia"
  | "sabedoria"
  | "profetas"
  | "evangelhos"
  | "cartas-paulo"
  | "epistolas";

export interface Livro {
  /** Posição canônica (1-66), casa com a chave numérica de `books` no JSON. */
  order: number;
  /** Código de 3 letras (ex.: "GEN"), usado como slug de rota em minúsculas. */
  codigo: string;
  nome: string;
  testamento: Testamento;
  grupo: Grupo;
  totalCapitulos: number;
}

/**
 * Um filtro/agrupamento selecionável na lista de livros (T-011, pedido do
 * usuário: "filtros por tipos"). `"harpa"` isola o cartão da Harpa Cristã
 * (pedido do usuário: Harpa passa a viver DENTRO da Bíblia, exibida depois
 * de Apocalipse, com este filtro próprio) — não é um `Livro` de verdade,
 * então nunca aparece em `getLivrosFiltrados`; a página trata esse caso à
 * parte.
 */
export type FiltroLivros = "canonico" | "cronologico" | Testamento | Grupo | "harpa";

/** Formato bruto do arquivo `public/data/biblia-almeida.json`. */
export interface BibliaData {
  translation: string;
  abbreviation: string;
  language: string;
  source: string;
  sourceVersion: string;
  sourceLicense: string;
  generatedAt: string;
  /** Chave = `Livro.order` como string; valor = capítulos, cada um um array de versículos (0-indexado). */
  books: Record<string, string[][]>;
}

/**
 * As 4 cores de marca-texto, migradas EXATAS do legado
 * (`CORES_MARCADOR` em `app.js`) — mesmos valores hex, mesma ordem,
 * reaproveitadas tanto no menu de marca-texto quanto no seletor de cor
 * do post-it (são a mesma paleta no legado, não duas listas separadas).
 */
export const CORES_MARCADOR = [
  { valor: "#fef08a", nome: "Amarelo" },
  { valor: "#fdba74", nome: "Laranja" },
  { valor: "#bbf7d0", nome: "Verde" },
  { valor: "#bfdbfe", nome: "Azul" },
] as const;

export type CorMarcador = (typeof CORES_MARCADOR)[number]["valor"];

export type TipoAnotacao = "highlight" | "note";

/**
 * Uma anotação sobre um TRECHO de texto de um versículo (não o versículo
 * inteiro) — `inicio`/`fim` são offsets de caractere dentro do texto
 * original do versículo. Migrado do modelo unificado do legado
 * (`notacoesCapitulo`, `app.js`): marca-texto e nota são o MESMO tipo de
 * registro (`type: "highlight" | "note"`), não dois campos independentes
 * numa mesma marcação — uma nota pode opcionalmente carregar uma cor de
 * marca-texto (`highlightColor`), e as duas nunca se empilham: aplicar
 * marca-texto sobre uma nota funde a cor NA nota; aplicar sobre outro
 * marca-texto substitui. Só uma anotação ocupa um dado trecho por vez
 * (ver `marcacoes.ts`).
 */
export interface Anotacao {
  id: string;
  type: TipoAnotacao;
  versiculo: number;
  inicio: number;
  fim: number;
  /** Cópia do texto original do trecho, para o preview no post-it/menu e "Copiar texto". */
  texto: string;
  /** Só para `type: "highlight"`. */
  color?: CorMarcador;
  /** Só para `type: "note"`. */
  noteContent?: string;
  /** Só para `type: "note"` — marca-texto opcional fundido na nota. */
  highlightColor?: CorMarcador;
}
