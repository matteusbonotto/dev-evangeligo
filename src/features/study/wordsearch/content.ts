import type { WordSearchPuzzle } from "./types";

/**
 * Desafios de caça-palavras (T-034, RF conteúdo adicional pedido pelo
 * usuário: "não tem... caça-palavras"). Os 3 primeiros migrados
 * diretamente de `dev-pwa-biblia-game` (`DESAFIOS_BIBLICOS.caca_palavras`);
 * mais 2 originais seguindo o mesmo padrão, ligados às trilhas TULIP e
 * Pactos (que ainda não tinham um desafio equivalente no legado).
 */
export const WORDSEARCH_PUZZLES: WordSearchPuzzle[] = [
  {
    id: "caca-fundamentos-fe",
    titulo: "Fundamentos da fé",
    palavras: ["JESUS", "GRAÇA", "AMOR", "PAZ", "FÉ"],
    referencia: "Efésios 2:8 · João 14:27",
    dica: "Encontre cinco palavras centrais da vida cristã.",
  },
  {
    id: "caca-vida-com-deus",
    titulo: "Vida com Deus",
    palavras: ["BÍBLIA", "ORAÇÃO", "IGREJA", "PERDÃO", "LOUVOR"],
    referencia: "Atos 2:42-47",
    dica: "Procure práticas que fortalecem a caminhada cristã.",
  },
  {
    id: "caca-armadura-espiritual",
    titulo: "Armadura espiritual",
    palavras: ["VERDADE", "JUSTIÇA", "SALVAÇÃO", "ESPÍRITO", "EVANGELHO"],
    referencia: "Efésios 6:10-18",
    dica: "As palavras podem estar na horizontal, vertical ou diagonal.",
  },
  {
    id: "caca-tulip",
    titulo: "Graça soberana (TULIP)",
    palavras: ["ELEIÇÃO", "GRAÇA", "EXPIAÇÃO", "CHAMADO", "PERSEVERANÇA"],
    referencia: "Efésios 1:4-5 · João 6:44",
    dica: "Cinco palavras ligadas aos cinco pontos do Calvinismo.",
  },
  {
    id: "caca-pactos",
    titulo: "Alianças de Deus",
    palavras: ["PACTO", "PROMESSA", "ADÃO", "CRISTO", "OBEDIÊNCIA"],
    referencia: "Gênesis 3:15 · Hebreus 8:6",
    dica: "Palavras da teologia do pacto — do Éden à nova aliança.",
  },
];

export function getWordSearchPuzzleById(id: string): WordSearchPuzzle | undefined {
  return WORDSEARCH_PUZZLES.find((p) => p.id === id);
}
