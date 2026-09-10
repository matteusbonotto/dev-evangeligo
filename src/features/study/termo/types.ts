/**
 * Tipos do "Termo Bíblico" (T-034) — clone de Wordle, migrado de
 * `dev-pwa-biblia-game` (`termoGame`/`avaliarTentativaTermo` em `app.js`).
 */
export interface TermoChallenge {
  id: string;
  resposta: string;
  referencia: string;
  explicacao: string;
}

export type StatusLetra = "correta" | "presente" | "ausente";

export interface TentativaTermo {
  palavra: string;
  avaliacao: StatusLetra[];
}

export type TermoStatusJogo = "em_andamento" | "venceu" | "perdeu";

export interface TermoSession {
  challenge: TermoChallenge;
  resposta: string;
  tamanho: number;
  maxTentativas: number;
  tentativaAtual: string;
  tentativas: TentativaTermo[];
  status: TermoStatusJogo;
}
