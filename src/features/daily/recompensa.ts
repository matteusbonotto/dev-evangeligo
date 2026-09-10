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
 * Credita a recompensa de uma vitória (Termo Bíblico / Quebra-cabeça) — e,
 * quando o desafio jogado É o escolhido pra hoje (`idJogado === idDeHoje`),
 * também marca aquele destaque como concluído no dia. Chamando de novo pro
 * MESMO tipo no MESMO dia não credita duas vezes (`estado.concluidos`
 * bloqueia) — mas isso só protege o caminho "destaque do dia"; jogar o
 * MESMO desafio fora do fluxo de destaques repetidamente ainda credita a
 * cada vitória (sem trava de "1x por desafio pra sempre") — decisão
 * deliberada de manter simples nesta primeira versão, consistente com o
 * resto do app não ter nenhum mecanismo anti-farming (regra 24 do
 * projeto: não punir de forma cruel).
 *
 * Antes do T-010 (RPG)/desta feature, `+XP · +ouro` no fim do Termo e do
 * Quebra-cabeça era só TEXTO — nunca creditava nada de verdade (mesmo gap
 * já documentado pro Quiz). Esta função é o primeiro ponto real de
 * crédito pros dois.
 */
export function creditarRecompensaDeJogo(params: {
  usuario: DemoUser;
  reward: Reward;
  desafioDiario?: {
    tipo: TipoDesafioDiario;
    idJogado: string;
    idDeHoje: string;
  };
  agora?: Date;
}): DemoUser {
  const { usuario, reward, desafioDiario, agora = new Date() } = params;

  if (desafioDiario && desafioDiario.idJogado === desafioDiario.idDeHoje) {
    const chave = obterChaveDoDia(agora);
    const estado = carregarEstadoDiario(chave);
    if (estado.concluidos[desafioDiario.tipo]) {
      return usuario;
    }
    marcarDesafioConcluido(chave, desafioDiario.tipo);
  }

  return aplicarRecompensaAoUsuario(usuario, reward);
}

/** Marca um destaque "passivo" (versículo/leitura do dia) como visto, creditando uma recompensa pequena de check-in — só na primeira vez do dia. */
export function marcarDestaquePassivoVisto(
  usuario: DemoUser,
  tipo: Extract<TipoDesafioDiario, "versiculo" | "leitura">,
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
