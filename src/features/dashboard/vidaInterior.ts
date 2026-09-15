import { supabaseClient } from "../../infrastructure/supabase/client";
import type { SpiritBattleEntry } from "../authentication/demo/demoUser";
import {
  PARES_VIDA_INTERIOR,
  type ParVidaInterior,
} from "./data/paresVidaInterior";

/**
 * "Vida Interior" real para contas autenticadas (Fase 5 do plano de UX,
 * T-059/ADR-051) — pedido explícito do usuário: os números de Fruto do
 * Espírito × Obra da Carne eram 100% estáticos/decorativos pra TODA conta
 * (demo e real), sem nenhum dado de verdade por trás. Agora a conta
 * autenticada registra um check-in diário rápido (`registrarCheckinVidaInterior`)
 * — "hoje você viveu mais [fruto] ou [obra]?" — e os percentuais viram uma
 * contagem real desses check-ins numa janela móvel de 30 dias. A conta
 * demonstração continua com os números fixos de `demoUser.ts` (nada aqui
 * se aplica a ela — não há sessão real pra registrar check-in).
 *
 * Revisão de UX pós-T-059 (ADR-052): o check-in virou um MODAL de
 * pergunta única, aberto a partir de um cartão em "Destaques de hoje"
 * (`daily/components/DestaquesDoDia.tsx`), em vez de 2 mini-formulários
 * soltos dentro do card "Vida Interior" do Dashboard. A rotação também
 * trocou de um sorteio por hash pra uma agenda semanal fixa que cobre os
 * 9 pares por semana (ver `AGENDA_SEMANAL` abaixo) — resolve a queixa "só
 * mostra 2 opções, como medir o resto?". Conectar isso a um sistema de
 * missões (`gamification/domain/missions.ts`, já tem um tipo "espiritual"
 * com um modelo de oração não usado) fica para quando esse sistema for
 * ligado a contas reais (plano de Comunidade já aprovado, em fila) — não
 * duplicado aqui.
 */

export type EscolhaVidaInterior = "fruto" | "carne";

interface LinhaCheckin {
  par_id: string;
  escolha: EscolhaVidaInterior;
}

const DIAS_JANELA = 30;

/**
 * Conta quantos check-ins de cada lado existem por par, dentro da lista já
 * filtrada pelo chamador (janela de 30 dias) — pura, sem rede, fácil de
 * testar. Um par sem nenhum check-in ainda fica 0×0 (a UI mostra 50%/50%
 * nesse caso, "sem dados ainda" em vez de fingir um número).
 */
export function calcularEntradasVidaInterior(
  checkins: LinhaCheckin[],
): SpiritBattleEntry[] {
  return PARES_VIDA_INTERIOR.map((par) => {
    let fruitValue = 0;
    let fleshValue = 0;
    for (const checkin of checkins) {
      if (checkin.par_id !== par.id) continue;
      if (checkin.escolha === "fruto") fruitValue += 1;
      else fleshValue += 1;
    }
    return { ...par, fruitValue, fleshValue };
  });
}

/** Carrega os check-ins reais dos últimos 30 dias e calcula os percentuais. Nunca lança — falha de rede vira "sem dados ainda" (0×0 em todo par). */
export async function carregarVidaInteriorReal(
  userId: string,
): Promise<SpiritBattleEntry[]> {
  if (!supabaseClient) return calcularEntradasVidaInterior([]);
  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_JANELA);
    const { data } = await supabaseClient
      .from("vida_interior_checkins")
      .select("par_id, escolha")
      .eq("user_id", userId)
      .gte("created_at", desde.toISOString());
    return calcularEntradasVidaInterior((data as LinhaCheckin[] | null) ?? []);
  } catch {
    return calcularEntradasVidaInterior([]);
  }
}

/** Registra 1 check-in ("hoje vivi mais fruto/obra neste par") — append-only, nunca UPDATE/DELETE, mesmo padrão de `consentimentos`. */
export async function registrarCheckinVidaInterior(
  userId: string,
  parId: string,
  escolha: EscolhaVidaInterior,
): Promise<void> {
  if (!supabaseClient) return;
  await supabaseClient.from("vida_interior_checkins").insert({
    user_id: userId,
    par_id: parId,
    escolha,
  });
}

/**
 * Agenda semanal FIXA (revisão de UX pós-T-059, ver ADR-052) — trocada do
 * sorteio por hash porque não garantia cobertura: dava a impressão de
 * "aleatório" sem nunca fechar o ciclo de forma visível, e o usuário
 * reportou que perguntar só 2 dos 9 pares não parecia medir a Vida
 * Interior de verdade. Cada dia da semana (domingo=0 .. sábado=6, sempre
 * o mesmo, não varia de semana pra semana) tem 1 ou 2 pares atribuídos —
 * ao final de qualquer semana corrida, os 9 já foram perguntados
 * exatamente uma vez. "Quantos dos 9 você já respondeu esta semana" vira
 * um número concreto (calculado na UI a partir do que já foi respondido),
 * não uma sensação vaga de aleatoriedade.
 */
const AGENDA_SEMANAL: readonly number[][] = [
  [0], // domingo — amor
  [1, 2], // segunda — alegria, paz
  [3], // terça — longanimidade
  [4], // quarta — benignidade
  [5, 6], // quinta — bondade, fidelidade
  [7], // sexta — mansidão
  [8], // sábado — domínio próprio
];

function paraDataUtc(chaveDoDia: string): Date {
  return new Date(`${chaveDoDia}T00:00:00Z`);
}

/** 0 = domingo .. 6 = sábado, calculado em UTC pra nunca depender do fuso horário de quem acessa. */
export function obterDiaDaSemana(chaveDoDia: string): number {
  return paraDataUtc(chaveDoDia).getUTCDay();
}

/**
 * Chave estável da semana ("YYYY-MM-DD" do domingo que abre a semana,
 * mesma convenção domingo-a-sábado de `AGENDA_SEMANAL`/`getUTCDay`) —
 * agrupa o progresso semanal, reseta sozinho todo domingo.
 */
export function obterChaveDaSemana(chaveDoDia: string): string {
  const data = paraDataUtc(chaveDoDia);
  data.setUTCDate(data.getUTCDate() - data.getUTCDay());
  return data.toISOString().slice(0, 10);
}

/** Os 1-2 pares atribuídos a hoje, pela agenda semanal fixa. */
export function obterParesDoCheckinHoje(chaveDoDia: string): ParVidaInterior[] {
  const indices = AGENDA_SEMANAL[obterDiaDaSemana(chaveDoDia)] ?? [];
  return indices.map((indice) => PARES_VIDA_INTERIOR[indice]);
}

/** Todos os 9 pares, na ordem do catálogo — usado pelo link "Responder os 9 agora". */
export function obterTodosOsPares(): ParVidaInterior[] {
  return PARES_VIDA_INTERIOR;
}
