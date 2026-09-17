import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../../authentication/context/AuthContext";
import { SpiritBattle } from "../components/SpiritBattle";
import {
  carregarHistoricoVidaInterior,
  type PeriodoComEntradas,
} from "../vidaInterior";
import { PARES_VIDA_INTERIOR } from "../data/paresVidaInterior";

/**
 * Histórico de Vida Interior por período de 30 dias (T-074, Fase 2 do
 * plano "Vida Interior: períodos de 30 dias com reset + histórico com
 * filtros") — pedido explícito do usuário: "deve ter um histórico com
 * filtros adequados para analisar o progresso e evolução do usuário".
 * Reaproveita `SpiritBattle` (o mesmo componente do card ao vivo do
 * Dashboard) passando as entradas do período escolhido — sem duplicar a
 * UI de barras/modal por par, só troca QUAL array de entradas ele recebe.
 */

/** 2 períodos fake só pra a conta demonstração ter algo pra mostrar aqui — claramente ilustrativo, nunca usado pelo cálculo real. */
const HISTORICO_DEMO: PeriodoComEntradas[] = [
  {
    numero: 1,
    inicio: new Date("2026-08-18T00:00:00Z"),
    fim: new Date("2026-09-17T00:00:00Z"),
    entradas: PARES_VIDA_INTERIOR.map((par, indice) => ({
      ...par,
      fruitValue: 8 + (indice % 4),
      fleshValue: 2 + (indice % 3),
    })),
  },
  {
    numero: 0,
    inicio: new Date("2026-07-19T00:00:00Z"),
    fim: new Date("2026-08-18T00:00:00Z"),
    entradas: PARES_VIDA_INTERIOR.map((par, indice) => ({
      ...par,
      fruitValue: 5 + (indice % 3),
      fleshValue: 3 + (indice % 4),
    })),
  },
];

function formatarPeriodo(periodo: PeriodoComEntradas): string {
  const formato: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const inicio = periodo.inicio.toLocaleDateString("pt-BR", formato);
  const fim = new Date(periodo.fim.getTime() - 86_400_000).toLocaleDateString(
    "pt-BR",
    formato,
  );
  return `${inicio} – ${fim}`;
}

export function VidaInteriorHistoricoPage() {
  const { user, supabaseUser } = useAuth();
  const [periodos, setPeriodos] = useState<PeriodoComEntradas[] | null>(null);
  const [numeroSelecionado, setNumeroSelecionado] = useState<number | null>(null);
  const [parFiltro, setParFiltro] = useState<string>("todos");

  useEffect(() => {
    if (user?.isDemo) {
      setPeriodos(HISTORICO_DEMO);
      setNumeroSelecionado(HISTORICO_DEMO[0]?.numero ?? null);
      return;
    }
    if (!supabaseUser) {
      setPeriodos([]);
      return;
    }
    let ativo = true;
    setPeriodos(null);
    carregarHistoricoVidaInterior(supabaseUser.id).then((resultado) => {
      if (!ativo) return;
      setPeriodos(resultado);
      setNumeroSelecionado(resultado[0]?.numero ?? null);
    });
    return () => {
      ativo = false;
    };
  }, [user, supabaseUser]);

  const periodoAtual =
    periodos?.find((p) => p.numero === numeroSelecionado) ?? null;
  const entradas = periodoAtual
    ? parFiltro === "todos"
      ? periodoAtual.entradas
      : periodoAtual.entradas.filter((e) => e.id === parFiltro)
    : [];

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section className="dash-card" aria-labelledby="historico-title">
          <p className="eyebrow" id="historico-title">
            Histórico — Vida Interior
          </p>
          <p className="civ-historico-intro">
            Cada período dura 30 dias. Veja como o Fruto do Espírito e as
            Obras da Carne apareceram em cada um.
          </p>

          {periodos === null && <p>Carregando…</p>}

          {periodos && periodos.length === 0 && (
            <p className="civ-historico-vazio">
              Nenhum período ainda — responda o check-in diário de Vida
              Interior por 30 dias pra ver seu primeiro histórico aqui.
            </p>
          )}

          {periodos && periodos.length > 0 && (
            <>
              <div className="civ-historico-filtros">
                <label className="civ-historico-campo">
                  <span>Período</span>
                  <select
                    value={numeroSelecionado ?? ""}
                    onChange={(event) =>
                      setNumeroSelecionado(Number(event.target.value))
                    }
                  >
                    {periodos.map((periodo) => (
                      <option key={periodo.numero} value={periodo.numero}>
                        {formatarPeriodo(periodo)}
                        {periodo.numero === periodos[0].numero
                          ? " (atual)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="civ-historico-campo">
                  <span>Par</span>
                  <select
                    value={parFiltro}
                    onChange={(event) => setParFiltro(event.target.value)}
                  >
                    <option value="todos">Todos os pares</option>
                    {PARES_VIDA_INTERIOR.map((par) => (
                      <option key={par.id} value={par.id}>
                        {par.fruitLabel} × {par.fleshLabel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {entradas.length > 0 ? (
                <SpiritBattle entries={entradas} />
              ) : (
                <p className="civ-historico-vazio">
                  Esse par não teve check-in nesse período.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
