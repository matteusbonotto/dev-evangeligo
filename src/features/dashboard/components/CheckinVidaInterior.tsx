import { useMemo, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../authentication/context/AuthContext";
import { obterChaveDoDia } from "../../daily/desafios";
import { marcarDestaquePassivoVisto } from "../../daily/recompensa";
import {
  obterParesDoCheckinHoje,
  registrarCheckinVidaInterior,
  type EscolhaVidaInterior,
} from "../vidaInterior";

const RECOMPENSA_CHECKIN = { xp: 5, gold: 2 };
const CHAVE_LS = "evangeligo:vidaInterior:respondidoHoje";

interface EstadoRespondidoHoje {
  chave: string;
  parIds: string[];
}

function carregarRespondidosHoje(chaveDoDia: string): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE_LS);
    if (!bruto) return [];
    const salvo = JSON.parse(bruto) as EstadoRespondidoHoje;
    return salvo.chave === chaveDoDia ? salvo.parIds : [];
  } catch {
    return [];
  }
}

function marcarRespondidoHoje(chaveDoDia: string, parId: string): string[] {
  const atual = carregarRespondidosHoje(chaveDoDia);
  const atualizado = atual.includes(parId) ? atual : [...atual, parId];
  try {
    localStorage.setItem(
      CHAVE_LS,
      JSON.stringify({ chave: chaveDoDia, parIds: atualizado }),
    );
  } catch {
    // localStorage indisponível — o check-in pode ser perguntado de novo, sem problema grave.
  }
  return atualizado;
}

/**
 * Check-in diário de Vida Interior (Fase 5 do plano de UX, T-059/ADR-051)
 * — pedido explícito do usuário: os percentuais de Fruto do Espírito ×
 * Obra da Carne eram só decoração, sem nenhum dado real por trás. Propõe
 * 2 dos 9 pares por dia (revezando, `obterParesDoCheckinHoje`) com uma
 * pergunta rápida "o que você viveu mais hoje?" — cada resposta vira um
 * check-in real em `vida_interior_checkins`, e os percentuais mostrados
 * em `SpiritBattle` (logo abaixo, no Dashboard) passam a refletir esses
 * check-ins de verdade. Só aparece pra conta REAL (`!isDemo`) — a conta
 * demonstração não tem uma sessão de verdade pra registrar nada, e
 * continua mostrando os números fixos de `demoUser.ts`.
 */
export function CheckinVidaInterior() {
  const { user, supabaseUser, updateUser } = useAuth();
  const chave = useMemo(() => obterChaveDoDia(), []);
  const pares = useMemo(() => obterParesDoCheckinHoje(chave), [chave]);
  const [respondidos, setRespondidos] = useState(() =>
    carregarRespondidosHoje(chave),
  );
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!user || user.isDemo || !supabaseUser) return null;

  const pendentes = pares.filter((par) => !respondidos.includes(par.id));

  if (pendentes.length === 0) {
    return (
      <p className="civ-feito">
        <FiCheckCircle aria-hidden="true" /> Check-in de hoje concluído —
        volte amanhã para o próximo.
      </p>
    );
  }

  async function responder(parId: string, escolha: EscolhaVidaInterior) {
    setEnviando(parId);
    setErro(null);
    try {
      await registrarCheckinVidaInterior(supabaseUser!.id, parId, escolha);
      setRespondidos(marcarRespondidoHoje(chave, parId));
      updateUser((atual) =>
        marcarDestaquePassivoVisto(
          {
            ...atual,
            spiritBattle: atual.spiritBattle.map((entry) =>
              entry.id === parId
                ? {
                    ...entry,
                    fruitValue:
                      entry.fruitValue + (escolha === "fruto" ? 1 : 0),
                    fleshValue:
                      entry.fleshValue + (escolha === "carne" ? 1 : 0),
                  }
                : entry,
            ),
          },
          "vidaInterior",
          RECOMPENSA_CHECKIN,
        ),
      );
    } catch {
      setErro("Não foi possível registrar agora. Tente de novo.");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="civ-checkin">
      <p className="civ-titulo">Check-in de hoje: o que você viveu mais?</p>
      {erro && <p className="civ-erro">{erro}</p>}
      <div className="civ-pares">
        {pendentes.map((par) => (
          <div key={par.id} className="civ-par">
            <p className="civ-pergunta">
              {par.fruitLabel} ou {par.fleshLabel}?
            </p>
            <div className="civ-botoes">
              <button
                type="button"
                className="civ-btn civ-btn--fruto"
                disabled={enviando === par.id}
                onClick={() => void responder(par.id, "fruto")}
              >
                {par.fruitLabel}
              </button>
              <button
                type="button"
                className="civ-btn civ-btn--carne"
                disabled={enviando === par.id}
                onClick={() => void responder(par.id, "carne")}
              >
                {par.fleshLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
