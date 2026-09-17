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

/** Histórico mínimo para rotação e sequência; o check-in continua append-only. */
export interface CheckinVidaInteriorComData {
  par_id: string;
  created_at: string;
}

const DIAS_PERIODO = 30;

export interface PeriodoVidaInterior {
  /** 0 = primeiro período de 30 dias desde o 1º check-in, 1 = o seguinte, etc. */
  numero: number;
  inicio: Date;
  /** Exclusivo — o período seguinte começa exatamente aqui. */
  fim: Date;
}

/**
 * Em que período de 30 dias "agora" cai, contando a partir do 1º check-in
 * do usuário (T-074, plano "Vida Interior: períodos de 30 dias com reset +
 * histórico") — pura, testável. Antes disso, `carregarVidaInteriorReal`
 * usava uma janela MÓVEL ("últimos 30 dias a partir de agora", recalculada
 * a cada carregamento) — funcionava pra manter os números pequenos, mas
 * não dava um marco fixo de início/fim pra comparar um período com o
 * anterior (o que o histórico do T-074 precisa). Sem nenhum check-in
 * ainda, `primeiroCheckin` pode ser o próprio `agora` — sempre cai no
 * período 0.
 */
export function calcularPeriodoAtual(
  primeiroCheckin: Date,
  agora: Date,
): PeriodoVidaInterior {
  const diasDesdeOPrimeiro = Math.max(
    0,
    Math.floor((agora.getTime() - primeiroCheckin.getTime()) / 86_400_000),
  );
  const numero = Math.floor(diasDesdeOPrimeiro / DIAS_PERIODO);
  const inicio = new Date(
    primeiroCheckin.getTime() + numero * DIAS_PERIODO * 86_400_000,
  );
  const fim = new Date(inicio.getTime() + DIAS_PERIODO * 86_400_000);
  return { numero, inicio, fim };
}

/**
 * Conta quantos check-ins de cada lado existem por par, dentro da lista já
 * filtrada pelo chamador (período de 30 dias) — pura, sem rede, fácil de
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

/**
 * Carrega os check-ins do PERÍODO ATUAL de 30 dias (não mais uma janela
 * móvel, T-074) e calcula os percentuais. Nunca lança — falha de rede ou
 * conta sem nenhum check-in ainda viram "sem dados ainda" (0×0 em todo
 * par).
 */
export async function carregarVidaInteriorReal(
  userId: string,
): Promise<SpiritBattleEntry[]> {
  if (!supabaseClient) return calcularEntradasVidaInterior([]);
  try {
    const { data: primeiro } = await supabaseClient
      .from("vida_interior_checkins")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!primeiro) return calcularEntradasVidaInterior([]);

    const periodo = calcularPeriodoAtual(
      new Date((primeiro as { created_at: string }).created_at),
      new Date(),
    );
    const { data } = await supabaseClient
      .from("vida_interior_checkins")
      .select("par_id, escolha")
      .eq("user_id", userId)
      .gte("created_at", periodo.inicio.toISOString())
      .lt("created_at", periodo.fim.toISOString());
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

const JANELA_ROTACAO_DIAS = 90;
const IDADE_SEM_REGISTRO = 21;
const LIMITE_GARANTIA_DIAS = 14;

function hashTexto(texto: string): number {
  let hash = 5381;
  for (const caractere of texto) {
    hash = (hash * 33 + (caractere.codePointAt(0) ?? 0)) >>> 0;
  }
  return hash;
}

/** PRNG estável: a mesma conta, data e histórico produzem a mesma pergunta. */
function criarAleatorio(seed: string): () => number {
  let estado = hashTexto(seed);
  return () => {
    estado += 0x6d2b79f5;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function inicioDoDia(chaveDoDia: string): Date {
  return new Date(`${chaveDoDia}T00:00:00`);
}

function diferencaEmDias(anterior: Date, posterior: Date): number {
  const inicioAnterior = new Date(anterior.getFullYear(), anterior.getMonth(), anterior.getDate());
  const inicioPosterior = new Date(posterior.getFullYear(), posterior.getMonth(), posterior.getDate());
  return Math.max(0, Math.round((inicioPosterior.getTime() - inicioAnterior.getTime()) / 86_400_000));
}

/**
 * Escolhe um par por dia com aleatoriedade reproduzível, favorecendo os menos
 * vistos e forçando cobertura antes que qualquer par passe 14 dias esquecido.
 * O histórico deve excluir o dia corrente para recarregar a página nunca trocar
 * a pergunta após uma resposta.
 */
export function obterParesDoCheckinHoje(
  chaveDoDia: string,
  userId: string,
  historico: CheckinVidaInteriorComData[],
  quantidade = 1,
): ParVidaInterior[] {
  const hoje = inicioDoDia(chaveDoDia);
  const ultimoPorPar = new Map<string, Date>();
  for (const checkin of historico) {
    const data = new Date(checkin.created_at);
    if (Number.isNaN(data.getTime()) || data >= hoje) continue;
    const anterior = ultimoPorPar.get(checkin.par_id);
    if (!anterior || data > anterior) ultimoPorPar.set(checkin.par_id, data);
  }
  const candidatos = PARES_VIDA_INTERIOR.map((par) => ({
    par,
    idade: ultimoPorPar.has(par.id)
      ? diferencaEmDias(ultimoPorPar.get(par.id)!, hoje)
      : IDADE_SEM_REGISTRO,
  }));
  const aleatorio = criarAleatorio(`${userId}:${chaveDoDia}:vida-interior:v2`);
  const escolhidos: ParVidaInterior[] = [];
  while (escolhidos.length < Math.min(quantidade, candidatos.length)) {
    const maisAtrasados = candidatos.filter((item) => item.idade >= LIMITE_GARANTIA_DIAS);
    const grupo = maisAtrasados.length > 0 ? maisAtrasados : candidatos;
    const pesos = grupo.map((item) => (1 + Math.min(item.idade, LIMITE_GARANTIA_DIAS)) ** 2);
    let alvo = aleatorio() * pesos.reduce((total, peso) => total + peso, 0);
    let indice = 0;
    for (; indice < pesos.length - 1; indice += 1) {
      alvo -= pesos[indice];
      if (alvo < 0) break;
    }
    const [escolhido] = grupo.splice(indice, 1);
    escolhidos.push(escolhido.par);
    candidatos.splice(candidatos.indexOf(escolhido), 1);
  }
  return escolhidos;
}

/** Carrega apenas o necessário para a rotação; 90 dias limitam a consulta. */
export async function carregarParesDoCheckinHoje(
  userId: string,
  chaveDoDia: string,
): Promise<ParVidaInterior[]> {
  if (!supabaseClient) return obterParesDoCheckinHoje(chaveDoDia, userId, []);
  try {
    const inicio = inicioDoDia(chaveDoDia);
    const desde = new Date(inicio);
    desde.setDate(desde.getDate() - JANELA_ROTACAO_DIAS);
    const { data } = await supabaseClient
      .from("vida_interior_checkins")
      .select("par_id, created_at")
      .eq("user_id", userId)
      .gte("created_at", desde.toISOString())
      .lt("created_at", inicio.toISOString());
    return obterParesDoCheckinHoje(
      chaveDoDia,
      userId,
      (data as CheckinVidaInteriorComData[] | null) ?? [],
    );
  } catch {
    return obterParesDoCheckinHoje(chaveDoDia, userId, []);
  }
}

export interface EstadoCheckinVidaInteriorHoje {
  paresHoje: ParVidaInterior[];
  parIdsRespondidosHoje: string[];
  sequencia: number;
}

/** Uma única leitura da fonte de verdade para rotação, proteção contra duplicata e streak. */
export async function carregarEstadoCheckinVidaInteriorHoje(
  userId: string,
  chaveDoDia: string,
): Promise<EstadoCheckinVidaInteriorHoje> {
  if (!supabaseClient) {
    return {
      paresHoje: obterParesDoCheckinHoje(chaveDoDia, userId, []),
      parIdsRespondidosHoje: [],
      sequencia: 0,
    };
  }
  try {
    const { data } = await supabaseClient
      .from("vida_interior_checkins")
      .select("par_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const historico = (data as CheckinVidaInteriorComData[] | null) ?? [];
    const respondidos = [...new Set(historico.filter((item) => {
      const data = new Date(item.created_at);
      return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}` === chaveDoDia;
    }).map((item) => item.par_id))];
    return {
      paresHoje: obterParesDoCheckinHoje(chaveDoDia, userId, historico),
      parIdsRespondidosHoje: respondidos,
      sequencia: calcularSequenciaVidaInterior(historico, chaveDoDia),
    };
  } catch {
    return {
      paresHoje: obterParesDoCheckinHoje(chaveDoDia, userId, []),
      parIdsRespondidosHoje: [],
      sequencia: 0,
    };
  }
}

/** Cenário também não muda em refresh; a UI só precisa indexar seu banco pelo retorno. */
export function obterIndiceCenarioVidaInterior(
  chaveDoDia: string,
  userId: string,
  parId: string,
  totalCenarios: number,
): number {
  return totalCenarios > 0
    ? hashTexto(`${userId}:${chaveDoDia}:${parId}:cenario:v1`) % totalCenarios
    : 0;
}

/** Dias consecutivos com ao menos uma reflexão; múltiplos pares contam uma vez. */
export function calcularSequenciaVidaInterior(
  historico: CheckinVidaInteriorComData[],
  chaveDoDia: string,
): number {
  const dias = new Set(historico.map((item) => {
    const data = new Date(item.created_at);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  }));
  const cursor = inicioDoDia(chaveDoDia);
  if (!dias.has(chaveDoDia)) cursor.setDate(cursor.getDate() - 1);
  let sequencia = 0;
  while (true) {
    const chave = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!dias.has(chave)) return sequencia;
    sequencia += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
}
