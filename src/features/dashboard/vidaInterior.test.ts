import { describe, expect, it } from "vitest";
import {
  calcularEntradasVidaInterior,
  calcularPeriodoAtual,
  calcularSequenciaVidaInterior,
  obterIndiceCenarioVidaInterior,
  obterParesDoCheckinHoje,
  type CheckinVidaInteriorComData,
} from "./vidaInterior";
import { PARES_VIDA_INTERIOR } from "./data/paresVidaInterior";

describe("calcularEntradasVidaInterior", () => {
  it("sem nenhum check-in, todo par fica 0x0 ('sem dados ainda', nunca um número fixo/fake)", () => {
    const entradas = calcularEntradasVidaInterior([]);
    expect(entradas).toHaveLength(PARES_VIDA_INTERIOR.length);
    for (const entrada of entradas) {
      expect(entrada.fruitValue).toBe(0);
      expect(entrada.fleshValue).toBe(0);
    }
  });

  it("conta check-ins reais por par, separando fruto de carne", () => {
    const entradas = calcularEntradasVidaInterior([
      { par_id: "amor", escolha: "fruto" },
      { par_id: "amor", escolha: "fruto" },
      { par_id: "amor", escolha: "carne" },
      { par_id: "paz", escolha: "carne" },
    ]);

    const amor = entradas.find((e) => e.id === "amor")!;
    expect(amor.fruitValue).toBe(2);
    expect(amor.fleshValue).toBe(1);

    const paz = entradas.find((e) => e.id === "paz")!;
    expect(paz.fruitValue).toBe(0);
    expect(paz.fleshValue).toBe(1);
  });

  it("preserva a metadata (rótulos/explicação) de cada par do catálogo", () => {
    const [primeiro] = calcularEntradasVidaInterior([]);
    expect(primeiro.fruitLabel).toBe(PARES_VIDA_INTERIOR[0].fruitLabel);
    expect(primeiro.explicacao).toBe(PARES_VIDA_INTERIOR[0].explicacao);
  });
});

/**
 * T-074 — plano "Vida Interior: períodos de 30 dias com reset +
 * histórico". Substitui a antiga janela MÓVEL ("últimos 30 dias a partir
 * de agora") por um período FIXO ancorado no 1º check-in, com início/fim
 * comparáveis — necessário pro histórico (Fase 2) e resolve o pedido do
 * usuário de "resetar a cada 30 dias".
 */
describe("calcularPeriodoAtual", () => {
  it("no dia do 1º check-in, está no período 0", () => {
    const primeiro = new Date("2026-01-01T00:00:00Z");
    const periodo = calcularPeriodoAtual(primeiro, primeiro);
    expect(periodo.numero).toBe(0);
    expect(periodo.inicio).toEqual(primeiro);
  });

  it("no dia 29 (dentro dos primeiros 30 dias), ainda está no período 0", () => {
    const primeiro = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-30T00:00:00Z"); // 29 dias depois
    expect(calcularPeriodoAtual(primeiro, agora).numero).toBe(0);
  });

  it("no dia 30 exato, vira o período 1 (o reset acontece aqui)", () => {
    const primeiro = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-31T00:00:00Z"); // 30 dias depois
    const periodo = calcularPeriodoAtual(primeiro, agora);
    expect(periodo.numero).toBe(1);
    expect(periodo.inicio).toEqual(new Date("2026-01-31T00:00:00Z"));
    expect(periodo.fim).toEqual(new Date("2026-03-02T00:00:00Z"));
  });

  it("vários períodos depois, ainda calcula certo (não é só o próximo)", () => {
    const primeiro = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-01T00:00:00Z");
    agora.setDate(agora.getDate() + 30 * 3 + 5); // período 3, 5 dias dentro dele
    expect(calcularPeriodoAtual(primeiro, agora).numero).toBe(3);
  });

  it("nunca lança erro quando 'agora' é antes do 1º check-in (relógio adiantado/atrasado) — cai no período 0", () => {
    const primeiro = new Date("2026-01-10T00:00:00Z");
    const agora = new Date("2026-01-01T00:00:00Z");
    expect(calcularPeriodoAtual(primeiro, agora).numero).toBe(0);
  });
});

/** `referencia` é a chave do dia (YYYY-MM-DD) a partir da qual contar `diasAtras` — nunca o relógio real, pra não depender de quando o teste roda. */
function checkin(
  parId: string,
  diasAtras: number,
  referencia: string,
): CheckinVidaInteriorComData {
  const data = new Date(`${referencia}T00:00:00`);
  data.setDate(data.getDate() - diasAtras);
  return { par_id: parId, created_at: data.toISOString() };
}

describe("obterParesDoCheckinHoje (rotação por peso/recência)", () => {
  it("mesmo usuário e dia sempre escolhe o mesmo par (determinístico, reload não reembaralha)", () => {
    const a = obterParesDoCheckinHoje("2026-09-15", "user-1", []);
    const b = obterParesDoCheckinHoje("2026-09-15", "user-1", []);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it("usuários diferentes podem receber pares diferentes no mesmo dia (a semente inclui o userId)", () => {
    const escolhas = new Set(
      Array.from({ length: 10 }, (_, i) =>
        obterParesDoCheckinHoje("2026-09-15", `user-${i}`, [])[0]?.id,
      ),
    );
    expect(escolhas.size).toBeGreaterThan(1);
  });

  it("nunca repete o mesmo par 2x quando pede mais de 1 no mesmo dia", () => {
    const pares = obterParesDoCheckinHoje("2026-09-15", "user-1", [], 5);
    expect(new Set(pares.map((p) => p.id)).size).toBe(pares.length);
  });

  it("favorece fortemente um par nunca respondido sobre pares respondidos ontem — comparado com muitas contas independentes no MESMO dia/histórico", () => {
    const dia = "2026-09-15";
    const historico = PARES_VIDA_INTERIOR.filter((p) => p.id !== "paz").map(
      (p) => checkin(p.id, 1, dia),
    );
    const contagem = { paz: 0, outro: 0 };
    for (let i = 0; i < 60; i += 1) {
      const [escolhido] = obterParesDoCheckinHoje(dia, `user-${i}`, historico);
      if (escolhido.id === "paz") contagem.paz += 1;
      else contagem.outro += 1;
    }
    // Sorteio uniforme entre 9 pares daria ~11% pra "paz" — a recência deve
    // empurrar isso bem acima disso.
    expect(contagem.paz / 60).toBeGreaterThan(0.3);
  });

  it("nunca deixa um par passar muito tempo sem aparecer (garantia de cobertura) — respondido há 21 dias sempre entra no grupo garantido", () => {
    const dia = "2026-09-15";
    const historico = PARES_VIDA_INTERIOR.map((p) =>
      checkin(p.id, p.id === "paz" ? 21 : 1, dia),
    );
    const apareceu = Array.from({ length: 20 }, (_, i) =>
      obterParesDoCheckinHoje(dia, `user-cobertura-${i}`, historico)[0].id,
    ).includes("paz");
    expect(apareceu).toBe(true);
  });
});

describe("calcularSequenciaVidaInterior", () => {
  const hoje = "2026-09-15";

  it("sem nenhum check-in, sequência é 0", () => {
    expect(calcularSequenciaVidaInterior([], hoje)).toBe(0);
  });

  it("dias consecutivos (incluindo hoje) contam a sequência corretamente", () => {
    const historico = [
      checkin("amor", 0, hoje),
      checkin("paz", 1, hoje),
      checkin("alegria", 2, hoje),
    ];
    expect(calcularSequenciaVidaInterior(historico, hoje)).toBe(3);
  });

  it("ainda não ter respondido hoje não zera a sequência — conta a partir de ontem", () => {
    const historico = [checkin("amor", 1, hoje), checkin("paz", 2, hoje)];
    expect(calcularSequenciaVidaInterior(historico, hoje)).toBe(2);
  });

  it("um dia sem nenhum check-in quebra a sequência", () => {
    const historico = [checkin("amor", 0, hoje), checkin("paz", 2, hoje)];
    expect(calcularSequenciaVidaInterior(historico, hoje)).toBe(1);
  });
});

describe("obterIndiceCenarioVidaInterior", () => {
  it("é determinístico pra mesma conta/dia/par e cai dentro do total de cenários", () => {
    const indice = obterIndiceCenarioVidaInterior(
      "2026-09-15",
      "user-1",
      "amor",
      14,
    );
    expect(indice).toBeGreaterThanOrEqual(0);
    expect(indice).toBeLessThan(14);
    expect(
      obterIndiceCenarioVidaInterior("2026-09-15", "user-1", "amor", 14),
    ).toBe(indice);
  });
});
