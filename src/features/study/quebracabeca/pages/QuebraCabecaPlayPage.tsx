import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../quebracabeca.css";
import { getVersiculoTexto } from "../../../bible/dataLoader";
import { getLivroByOrder } from "../../../bible/data/livros";
import { useAuth } from "../../../authentication/context/AuthContext";
import { obterChaveDoDia, obterQuebraCabecaDoDia } from "../../../daily/desafios";
import { creditarRecompensaDeJogo } from "../../../daily/recompensa";
import { getQuebraCabecaChallengeById } from "../content";
import {
  estaCorreto,
  iniciarQuebraCabeca,
  posicionarPalavra,
  removerDaMontada,
} from "../engine";
import { QUEBRA_CABECA_ROUTE_PATHS } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import type { QuebraCabecaSession } from "../types";

const XP_POR_QUEBRA_CABECA = 50;
const OURO_POR_QUEBRA_CABECA = 25;

type CarregamentoStatus = "carregando" | "pronto" | "erro";

/**
 * Quebra-cabeça (T-035): reordenar as palavras de um versículo já
 * migrado da Bíblia (`bible/dataLoader.ts`), ao estilo "monte a frase" do
 * Duolingo. Sem equivalente no app legado — ver ADR-023.
 */
export function QuebraCabecaPlayPage() {
  const { id } = useParams<{ id: string }>();
  const challenge = id ? getQuebraCabecaChallengeById(id) : undefined;
  const livro = challenge ? getLivroByOrder(challenge.livroOrder) : undefined;
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState<CarregamentoStatus>("carregando");
  const [session, setSession] = useState<QuebraCabecaSession | null>(null);
  const [verificado, setVerificado] = useState(false);
  const recompensaCreditadaRef = useRef(false);

  useEffect(() => {
    if (!challenge) return;
    let ativo = true;
    setStatus("carregando");
    setSession(null);
    setVerificado(false);
    recompensaCreditadaRef.current = false;
    getVersiculoTexto(challenge.livroOrder, challenge.capitulo, challenge.versiculo)
      .then((texto) => {
        if (!ativo) return;
        setSession(iniciarQuebraCabeca(texto));
        setStatus("pronto");
      })
      .catch(() => {
        if (ativo) setStatus("erro");
      });
    return () => {
      ativo = false;
    };
  }, [challenge]);

  const acertou = session ? estaCorreto(session) : false;

  useEffect(() => {
    if (!challenge || !verificado || !acertou || !user) return;
    if (recompensaCreditadaRef.current) return;
    recompensaCreditadaRef.current = true;
    const idDeHoje = obterQuebraCabecaDoDia(obterChaveDoDia()).id;
    updateUser((atual) =>
      creditarRecompensaDeJogo({
        usuario: atual,
        reward: { xp: XP_POR_QUEBRA_CABECA, gold: OURO_POR_QUEBRA_CABECA },
        desafioDiario: { tipo: "quebra", idJogado: challenge.id, idDeHoje },
      }),
    );
  }, [verificado, acertou, challenge, user, updateUser]);

  if (!challenge || !livro) {
    return <Navigate to={QUEBRA_CABECA_ROUTE_PATHS.lista} replace />;
  }

  const referencia = `${livro.nome} ${challenge.capitulo}:${challenge.versiculo}`;

  function handleVerificar() {
    setVerificado(true);
  }

  function handleReiniciar() {
    if (!session) return;
    setSession(iniciarQuebraCabeca(session.palavrasCorretas.join(" ")));
    setVerificado(false);
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={QUEBRA_CABECA_ROUTE_PATHS.lista}>
          <FiArrowLeft aria-hidden="true" /> Quebra-cabeça
        </Link>

        <article className="dash-card" aria-labelledby="quebra-cabeca-titulo">
          <p className="eyebrow" id="quebra-cabeca-titulo">
            {referencia}
          </p>

          {status === "carregando" && (
            <p className="biblia-status">Carregando versículo...</p>
          )}
          {status === "erro" && (
            <p className="biblia-status biblia-status--erro">
              Não foi possível carregar este desafio. Tente novamente.
            </p>
          )}

          {status === "pronto" && session && !(verificado && acertou) && (
            <>
              <p
                className="quebra-cabeca-aviso"
                role="status"
                aria-live="polite"
              >
                {verificado && !acertou
                  ? "Ainda não está certo. Continue ajustando."
                  : ""}
              </p>

              <div
                className="quebra-cabeca-montada"
                role="group"
                aria-label="Frase montada"
              >
                {session.montada.length === 0 && (
                  <span className="quebra-cabeca-montada-vazia">
                    Toque nas palavras abaixo para montar a frase.
                  </span>
                )}
                {session.montada.map((indice, posicao) => (
                  <button
                    key={`${indice}-${posicao}`}
                    type="button"
                    className="quebra-cabeca-ficha quebra-cabeca-ficha--montada"
                    onClick={() => {
                      setSession(removerDaMontada(session, posicao));
                      setVerificado(false);
                    }}
                  >
                    {session.palavrasCorretas[indice]}
                  </button>
                ))}
              </div>

              <div
                className="quebra-cabeca-banco"
                role="group"
                aria-label="Banco de palavras"
              >
                {session.banco.map((indice, posicaoNoBanco) => (
                  <button
                    key={`${indice}-${posicaoNoBanco}`}
                    type="button"
                    className="quebra-cabeca-ficha"
                    onClick={() => {
                      setSession(posicionarPalavra(session, posicaoNoBanco));
                      setVerificado(false);
                    }}
                  >
                    {session.palavrasCorretas[indice]}
                  </button>
                ))}
              </div>

              <div className="quiz-results-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleReiniciar}
                >
                  Recomeçar
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={session.banco.length > 0}
                  onClick={handleVerificar}
                >
                  Verificar
                </button>
              </div>
            </>
          )}

          {status === "pronto" && session && verificado && acertou && (
            <div className="quiz-results">
              <h1>Você acertou!</h1>
              <p className="quiz-results-score">
                {session.palavrasCorretas.join(" ")}
              </p>
              <p className="quiz-results-reward">
                +{XP_POR_QUEBRA_CABECA} XP · +{OURO_POR_QUEBRA_CABECA} ouro
              </p>
              <div className="quiz-results-actions">
                <Link
                  className="primary-button"
                  to={QUEBRA_CABECA_ROUTE_PATHS.lista}
                >
                  Ver outros desafios
                </Link>
              </div>
            </div>
          )}
        </article>
      </div>
    </AppShell>
  );
}
