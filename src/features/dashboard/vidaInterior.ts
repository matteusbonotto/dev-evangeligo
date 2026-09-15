import { supabaseClient } from "../../infrastructure/supabase/client";
import type { SpiritBattleEntry } from "../authentication/demo/demoUser";
import { PARES_VIDA_INTERIOR } from "./data/paresVidaInterior";

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
 * Escolhe determinística e estavelmente (mesmo dia = mesmos pares, muda
 * sozinho à meia-noite — mesmo espírito de `daily/desafios.ts`) 2 dos 9
 * pares pra propor o check-in de hoje, revezando ao longo dos dias em vez
 * de perguntar os 9 de uma vez (pedido do usuário: "check-in diário
 * rápido").
 */
export function obterParesDoCheckinHoje(chaveDoDia: string, quantidade = 2) {
  let hash = 5381;
  for (const caractere of chaveDoDia) {
    hash = (hash * 33 + (caractere.codePointAt(0) ?? 0)) >>> 0;
  }
  const indices = new Set<number>();
  let passo = 0;
  while (indices.size < quantidade && passo < PARES_VIDA_INTERIOR.length) {
    indices.add((hash + passo * 7) % PARES_VIDA_INTERIOR.length);
    passo += 1;
  }
  return Array.from(indices).map((indice) => PARES_VIDA_INTERIOR[indice]);
}
