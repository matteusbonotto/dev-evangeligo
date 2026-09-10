import { normalizarPalavra } from "../texto";
import type {
  StatusLetra,
  TermoChallenge,
  TermoSession,
  TentativaTermo,
} from "./types";

/**
 * Motor do "Termo Bíblico" (T-034) — TypeScript puro, sem dependência de
 * React. Algoritmo de avaliação (`avaliarTentativa`) portado fielmente de
 * `app.js` (`avaliarTentativaTermo`): mesmo tratamento de letras
 * duplicadas do Wordle original — uma letra só conta "presente" se ainda
 * sobrar uma ocorrência dela na resposta não coberta por acertos exatos.
 */

export const MAX_TENTATIVAS_PADRAO = 6;

export function avaliarTentativa(
  tentativa: string,
  resposta: string,
): StatusLetra[] {
  const letrasTentativa = [...tentativa];
  const letrasResposta = [...resposta];
  const avaliacao: StatusLetra[] = Array(letrasResposta.length).fill("ausente");
  const restantes: Record<string, number> = {};

  letrasResposta.forEach((letra, index) => {
    if (letrasTentativa[index] === letra) {
      avaliacao[index] = "correta";
    } else {
      restantes[letra] = (restantes[letra] ?? 0) + 1;
    }
  });

  letrasTentativa.forEach((letra, index) => {
    if (avaliacao[index] === "correta") return;
    if ((restantes[letra] ?? 0) > 0) {
      avaliacao[index] = "presente";
      restantes[letra]--;
    }
  });

  return avaliacao;
}

export function iniciarTermo(
  challenge: TermoChallenge,
  maxTentativas: number = MAX_TENTATIVAS_PADRAO,
): TermoSession {
  const resposta = normalizarPalavra(challenge.resposta);
  return {
    challenge,
    resposta,
    tamanho: resposta.length,
    maxTentativas,
    tentativaAtual: "",
    tentativas: [],
    status: "em_andamento",
  };
}

export function digitarLetra(session: TermoSession, letra: string): TermoSession {
  if (session.status !== "em_andamento") return session;
  const normalizada = normalizarPalavra(letra).slice(0, 1);
  if (!normalizada) return session;
  if (session.tentativaAtual.length >= session.tamanho) return session;
  return { ...session, tentativaAtual: session.tentativaAtual + normalizada };
}

export function apagarLetra(session: TermoSession): TermoSession {
  if (session.status !== "em_andamento") return session;
  return { ...session, tentativaAtual: session.tentativaAtual.slice(0, -1) };
}

export interface EnvioResultado {
  session: TermoSession;
  erro?: string;
}

/** Confirma a tentativa atual. `erro` é preenchido (sem mudar o estado) se a palavra não tem o tamanho certo. */
export function enviarTentativa(session: TermoSession): EnvioResultado {
  if (session.status !== "em_andamento") {
    return { session };
  }
  if (session.tentativaAtual.length !== session.tamanho) {
    return {
      session,
      erro: `Complete as ${session.tamanho} letras antes de confirmar.`,
    };
  }

  const avaliacao = avaliarTentativa(session.tentativaAtual, session.resposta);
  const tentativa: TentativaTermo = { palavra: session.tentativaAtual, avaliacao };
  const tentativas = [...session.tentativas, tentativa];
  const acertou = session.tentativaAtual === session.resposta;
  const status: TermoSession["status"] = acertou
    ? "venceu"
    : tentativas.length >= session.maxTentativas
      ? "perdeu"
      : "em_andamento";

  return {
    session: { ...session, tentativas, tentativaAtual: "", status },
  };
}

const PRIORIDADE: Record<StatusLetra, number> = {
  ausente: 1,
  presente: 2,
  correta: 3,
};

/** Melhor status já visto para uma letra, para colorir o teclado virtual. */
export function statusLetraTeclado(
  session: TermoSession,
  letra: string,
): StatusLetra | null {
  let melhor: StatusLetra | null = null;
  for (const tentativa of session.tentativas) {
    [...tentativa.palavra].forEach((item, index) => {
      if (item !== letra) return;
      const status = tentativa.avaliacao[index];
      if (!melhor || PRIORIDADE[status] > PRIORIDADE[melhor]) {
        melhor = status;
      }
    });
  }
  return melhor;
}
