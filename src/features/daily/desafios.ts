import { getLivroByOrder, LIVROS_BIBLIA } from "../bible/data/livros";
import { QUEBRA_CABECA_CHALLENGES } from "../study/quebracabeca/content";
import { TERMO_CHALLENGES } from "../study/termo/content";
import { WORDSEARCH_PUZZLES } from "../study/wordsearch/content";
import type { QuebraCabecaChallenge } from "../study/quebracabeca/types";
import type { TermoChallenge } from "../study/termo/types";
import type { WordSearchPuzzle } from "../study/wordsearch/types";

/**
 * Destaques do dia (Home): versículo/termo/quebra-cabeça/leitura escolhidos
 * de forma DETERMINÍSTICA a partir da data — o mesmo dia sempre escolhe o
 * mesmo desafio (não é aleatório a cada render), e troca sozinho à meia-
 * noite local porque a chave do dia muda. Pedido do usuário: "os desafios
 * devem ser atualizados a cada 24h e mostrar o tempo de reset decrescente"
 * (ver `tempo.ts` pro cronômetro).
 */

/** Chave estável do dia local, no formato "AAAA-MM-DD". */
export function obterChaveDoDia(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** Hash simples e estável (soma de code points) — só precisa ser determinístico, não criptográfico. */
function hashTexto(texto: string): number {
  let soma = 0;
  for (const caractere of texto) soma += caractere.codePointAt(0) ?? 0;
  return soma;
}

export interface VersiculoDoDia {
  livroOrder: number;
  codigo: string;
  capitulo: number;
  versiculo: number;
  referencia: string;
}

/**
 * Reaproveita as referências já curadas do quebra-cabeça (`QUEBRA_CABECA_CHALLENGES`)
 * como fonte do "versículo do dia" — evita duplicar uma segunda lista de
 * versículos "bons pra destacar" além da que já existe e já foi revisada.
 */
export function obterVersiculoDoDia(chaveDoDia: string): VersiculoDoDia {
  const escolhido =
    QUEBRA_CABECA_CHALLENGES[hashTexto(`${chaveDoDia}:versiculo`) % QUEBRA_CABECA_CHALLENGES.length];
  const livro = getLivroByOrder(escolhido.livroOrder);
  return {
    livroOrder: escolhido.livroOrder,
    codigo: livro?.codigo ?? "",
    capitulo: escolhido.capitulo,
    versiculo: escolhido.versiculo,
    referencia: `${livro?.nome ?? ""} ${escolhido.capitulo}:${escolhido.versiculo}`,
  };
}

export function obterTermoDoDia(chaveDoDia: string): TermoChallenge {
  return TERMO_CHALLENGES[hashTexto(`${chaveDoDia}:termo`) % TERMO_CHALLENGES.length];
}

export function obterQuebraCabecaDoDia(chaveDoDia: string): QuebraCabecaChallenge {
  return QUEBRA_CABECA_CHALLENGES[hashTexto(`${chaveDoDia}:quebra`) % QUEBRA_CABECA_CHALLENGES.length];
}

export function obterCacaPalavrasDoDia(chaveDoDia: string): WordSearchPuzzle {
  return WORDSEARCH_PUZZLES[
    hashTexto(`${chaveDoDia}:caca-palavras`) % WORDSEARCH_PUZZLES.length
  ];
}

export interface LeituraDoDia {
  livroOrder: number;
  codigo: string;
  nome: string;
  capitulo: number;
}

/**
 * Percorre os 66 livros em ordem canônica, 1 por dia (dia desde a época
 * Unix `% 66`) — um plano de leitura sequencial e prático, em vez de
 * saltar aleatoriamente entre livros todo dia. O capítulo dentro do livro
 * escolhido do dia é que varia por hash (senão toda volta ao mesmo livro
 * cairia sempre no capítulo 1).
 */
export function obterLeituraDoDia(chaveDoDia: string): LeituraDoDia {
  const diasDesdeEpoca = Math.floor(Date.parse(chaveDoDia) / 86_400_000);
  const indiceLivro = ((diasDesdeEpoca % LIVROS_BIBLIA.length) + LIVROS_BIBLIA.length) % LIVROS_BIBLIA.length;
  const livro = LIVROS_BIBLIA[indiceLivro];
  const capitulo = (hashTexto(`${chaveDoDia}:leitura`) % livro.totalCapitulos) + 1;
  return {
    livroOrder: livro.order,
    codigo: livro.codigo,
    nome: livro.nome,
    capitulo,
  };
}
