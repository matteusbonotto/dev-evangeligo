import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../authentication/context/AuthContext";
import { obterChaveDoDia } from "../../daily/desafios";
import { marcarDestaquePassivoVisto } from "../../daily/recompensa";
import { carregarEstadoDiario } from "../../daily/persistencia";
import {
  carregarEstadoCheckinVidaInteriorHoje,
  obterIndiceCenarioVidaInterior,
  registrarCheckinVidaInterior,
  type EscolhaVidaInterior,
} from "../vidaInterior";
import { PARES_VIDA_INTERIOR } from "../data/paresVidaInterior";
import { CENARIOS_VIDA_INTERIOR } from "../data/cenariosVidaInterior";

const RECOMPENSA_CHECKIN = { xp: 5, gold: 2 };
/**
 * Check-in de Vida Interior — cartão em "Destaques de hoje" que abre um
 * MODAL de pergunta única (revisão de UX pós-T-059, ver ADR-052).
 *
 * Antes (T-059) isso era 2 mini-formulários soltos dentro do card "Vida
 * Interior" do Dashboard — feedback direto do usuário: "poderia ser
 * facilmente um modal com um form rápido... só tá mostrando 2 opções, e aí
 * como medir o resto?". Duas mudanças respondem isso:
 * 1. Virou modal (uma pergunta por vez, com barra de progresso e uma
 *    explicação opcional) em vez de mini-cartões — cabe no fluxo de
 *    "Destaques de hoje" que já existe pros outros hábitos diários.
 * 2. A rotação trocou de sorteio por hash pra uma agenda semanal FIXA
 *    (`vidaInterior.ts#AGENDA_SEMANAL`) que cobre os 9 pares por semana —
 *    "quantos dos 9 você já respondeu esta semana" agora é um número
 *    concreto, mostrado no próprio cartão, não uma sensação vaga.
 *
 * Conectar isso a um sistema de missões (`gamification/domain/missions.ts`)
 * fica para quando esse sistema for ligado a contas reais (plano de
 * Comunidade já aprovado, em fila) — fora do escopo desta revisão.
 */
export function CheckinVidaInterior() {
  const { user, supabaseUser, updateUser } = useAuth();
  const chave = useMemo(() => obterChaveDoDia(), []);
  const [paresHoje, setParesHoje] = useState<typeof PARES_VIDA_INTERIOR>([]);
  const [respondidosHoje, setRespondidosHoje] = useState<string[]>([]);
  const [sequencia, setSequencia] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [fila, setFila] = useState<typeof PARES_VIDA_INTERIOR>([]);
  const [indice, setIndice] = useState(0);
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [ganhouRecompensaHoje, setGanhouRecompensaHoje] = useState(false);

  useEffect(() => {
    if (!supabaseUser || user?.isDemo) return;
    let ativo = true;
    void carregarEstadoCheckinVidaInteriorHoje(supabaseUser.id, chave).then((estado) => {
      if (!ativo) return;
      setParesHoje(estado.paresHoje);
      setRespondidosHoje(estado.parIdsRespondidosHoje);
      setSequencia(estado.sequencia);
      setCarregando(false);
    });
    return () => { ativo = false; };
  }, [chave, supabaseUser, user?.isDemo]);

  if (!user || user.isDemo || !supabaseUser) return null;

  const pendentesHoje = paresHoje.filter(
    (par) => !respondidosHoje.includes(par.id),
  );
  const tudoRespondidoHoje = !carregando && pendentesHoje.length === 0;

  function abrirModal() {
    setFila(pendentesHoje);
    setIndice(0);
    setMostrarExplicacao(false);
    setErro(null);
    setConcluido(false);
    setGanhouRecompensaHoje(!carregarEstadoDiario(chave).concluidos.vidaInterior);
    setModalAberto(true);
  }

  async function responder(parId: string, escolha: EscolhaVidaInterior) {
    setEnviando(true);
    setErro(null);
    try {
      await registrarCheckinVidaInterior(supabaseUser!.id, parId, escolha);
      const eraPrimeiroDoDia = respondidosHoje.length === 0;
      setRespondidosHoje((atual) => atual.includes(parId) ? atual : [...atual, parId]);
      if (eraPrimeiroDoDia) setSequencia((atual) => atual + 1);

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

      if (indice + 1 >= fila.length) {
        setConcluido(true);
      } else {
        setIndice((atual) => atual + 1);
      }
      setMostrarExplicacao(false);
    } catch {
      setErro("Não foi possível registrar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const parAtual = fila[indice];

  return (
    <>
      <button
        type="button"
        className={`destaque-card destaque-card--acao civ-card${tudoRespondidoHoje ? " destaque-card--feito" : ""}`}
        onClick={abrirModal}
      >
        <p className="destaque-card-titulo">
          <FiHeart aria-hidden="true" /> Vida Interior
        </p>
        <p className="destaque-card-referencia">
          {carregando ? "Carregando reflexão..." : `🔥 ${sequencia} ${sequencia === 1 ? "dia seguido" : "dias seguidos"} refletindo`}
        </p>
        <span className="destaque-card-link">
          {tudoRespondidoHoje ? "Concluído ✓" : "Fazer check-in"}
        </span>
      </button>

      {modalAberto && (
        <div
          className="civ-modal-overlay"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="civ-modal"
            role="dialog"
            aria-label="Check-in de Vida Interior"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="civ-modal-cabecalho">
              <p className="civ-modal-titulo">
                <FiHeart aria-hidden="true" /> Vida Interior
              </p>
              <button
                type="button"
                className="civ-modal-fechar"
                aria-label="Fechar"
                onClick={() => setModalAberto(false)}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            {concluido || !parAtual ? (
              <div className="civ-modal-corpo civ-modal-fim">
                <FiCheckCircle
                  className="civ-modal-fim-icone"
                  aria-hidden="true"
                />
                <p className="civ-modal-fim-texto">
                  {fila.length > 0
                    ? "Check-in registrado — obrigado por refletir hoje!"
                    : "Você já respondeu os pares de hoje."}
                </p>
                {fila.length > 0 && ganhouRecompensaHoje && (
                  <p className="civ-modal-fim-recompensa">
                    +{RECOMPENSA_CHECKIN.xp} XP · +{RECOMPENSA_CHECKIN.gold}{" "}
                    ouro
                  </p>
                )}
                <p className="civ-modal-fim-progresso">
                  🔥 {sequencia} {sequencia === 1 ? "dia seguido refletindo" : "dias seguidos refletindo"}
                </p>
                <button
                  type="button"
                  className="primary-button full"
                  onClick={() => setModalAberto(false)}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="civ-modal-corpo">
                <div
                  className="civ-modal-progresso"
                  role="progressbar"
                  aria-valuenow={indice + 1}
                  aria-valuemin={1}
                  aria-valuemax={fila.length}
                >
                  {fila.map((par, i) => (
                    <span
                      key={par.id}
                      className={`civ-modal-ponto${i === indice ? " civ-modal-ponto--ativo" : ""}${i < indice ? " civ-modal-ponto--feito" : ""}`}
                    />
                  ))}
                </div>

                {erro && <p className="civ-erro">{erro}</p>}

                {(() => {
                  const cenarios = CENARIOS_VIDA_INTERIOR[parAtual.id];
                  const cenario = cenarios[obterIndiceCenarioVidaInterior(chave, supabaseUser!.id, parAtual.id, cenarios.length)];
                  return <>
                    <p className="civ-modal-pergunta">{cenario.pergunta}</p>
                    <div className="civ-modal-botoes">
                      <button type="button" className="civ-btn civ-btn--fruto civ-btn--grande" disabled={enviando} onClick={() => void responder(parAtual.id, "fruto")}>{cenario.opcaoFruto}</button>
                      <button type="button" className="civ-btn civ-btn--carne civ-btn--grande" disabled={enviando} onClick={() => void responder(parAtual.id, "carne")}>{cenario.opcaoCarne}</button>
                    </div>
                  </>;
                })()}

                <button
                  type="button"
                  className="civ-modal-explicacao-toggle"
                  onClick={() => setMostrarExplicacao((atual) => !atual)}
                >
                  O que isso significa?{" "}
                  {mostrarExplicacao ? (
                    <FiChevronUp aria-hidden="true" />
                  ) : (
                    <FiChevronDown aria-hidden="true" />
                  )}
                </button>
                {mostrarExplicacao && (
                  <div className="civ-modal-explicacao">
                    <p>{parAtual.explicacao}</p>
                    <p>
                      <strong>No dia a dia:</strong> {parAtual.exemploDoDia}
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
