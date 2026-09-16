import type { DemoUser } from "../authentication/demo/demoUser";
import type { Reward } from "../gamification/domain/types";
import { aplicarRecompensaAoUsuario } from "../rpg/progresso";
import { obterChaveDoDia } from "./desafios";
import {
  carregarEstadoDiario,
  marcarDesafioConcluido,
  type TipoDesafioDiario,
} from "./persistencia";

/**
 * Recompensa reduzida pra vitórias "extras" do mesmo tipo de jogo no mesmo
 * dia — mesmo valor da recompensa de check-in passivo (`RECOMPENSA_CHECKIN`
 * em `DestaquesDoDia.tsx`/`CheckinVidaInterior.tsx`), de propósito: se dá
 * pra farmar (rejogar Termo/Quebra-cabeça/Caça-palavras sem limite), o
 * valor tem que ser baixo o bastante pra não compensar.
 */
const RECOMPENSA_REPETIDA: Reward = { xp: 5, gold: 2 };

export interface ResultadoRecompensaJogo {
  usuario: DemoUser;
  /** A recompensa REALMENTE aplicada — pode ser menor que a pedida em `reward`, ver `recompensaCheia`. */
  recompensa: Reward;
  /** `false` quando esta vitória já era a 2ª+ desse tipo de jogo hoje (recebeu `RECOMPENSA_REPETIDA` em vez do valor cheio). */
  recompensaCheia: boolean;
}

/**
 * Credita a recompensa de uma vitória (Termo Bíblico / Quebra-cabeça /
 * Caça-palavras). Achado real da auditoria (2026-09-16): jogar um desafio
 * que NÃO é o "destaque de hoje" sempre creditava o valor cheio (50 XP/25
 * ouro), sem limite de repetição — dava pra farmar infinitamente, ~10x
 * mais rápido que os check-ins passivos (5 XP/2 ouro, 1x/dia). Corrigido:
 * a recompensa CHEIA só é dada 1x por dia POR TIPO de jogo (não importa
 * qual desafio específico dentro daquele tipo); qualquer vitória extra do
 * MESMO tipo no MESMO dia recebe só `RECOMPENSA_REPETIDA`. Isso recompensa
 * CONSISTÊNCIA (voltar todo dia), não VOLUME (jogar muitas rodadas de
 * uma vez) — mesmo espírito do resto do app (regra 24: não punir de forma
 * cruel, só não vale a pena farmar).
 *
 * Antes do T-010 (RPG)/desta feature, `+XP · +ouro` no fim do Termo e do
 * Quebra-cabeça era só TEXTO — nunca creditava nada de verdade (mesmo gap
 * já documentado pro Quiz). Esta função é o primeiro ponto real de
 * crédito pros dois.
 */
export function creditarRecompensaDeJogo(params: {
  usuario: DemoUser;
  reward: Reward;
  tipo: TipoDesafioDiario;
  agora?: Date;
}): ResultadoRecompensaJogo {
  const { usuario, reward, tipo, agora = new Date() } = params;
  const chave = obterChaveDoDia(agora);
  const estado = carregarEstadoDiario(chave);

  if (estado.concluidos[tipo]) {
    return {
      usuario: aplicarRecompensaAoUsuario(usuario, RECOMPENSA_REPETIDA),
      recompensa: RECOMPENSA_REPETIDA,
      recompensaCheia: false,
    };
  }

  marcarDesafioConcluido(chave, tipo);
  return {
    usuario: aplicarRecompensaAoUsuario(usuario, reward),
    recompensa: reward,
    recompensaCheia: true,
  };
}

/** Marca um destaque "passivo" (versículo/leitura/vida interior do dia) como visto, creditando uma recompensa pequena de check-in — só na primeira vez do dia. */
export function marcarDestaquePassivoVisto(
  usuario: DemoUser,
  tipo: Extract<TipoDesafioDiario, "versiculo" | "leitura" | "vidaInterior">,
  reward: Reward,
  agora: Date = new Date(),
): DemoUser {
  const chave = obterChaveDoDia(agora);
  const estado = carregarEstadoDiario(chave);
  if (estado.concluidos[tipo]) {
    return usuario;
  }
  marcarDesafioConcluido(chave, tipo);
  return aplicarRecompensaAoUsuario(usuario, reward);
}
