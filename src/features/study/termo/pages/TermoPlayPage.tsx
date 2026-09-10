import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDelete } from "react-icons/fi";
import "../termo.css";
import { useAuth } from "../../../authentication/context/AuthContext";
import { obterChaveDoDia, obterTermoDoDia } from "../../../daily/desafios";
import { creditarRecompensaDeJogo } from "../../../daily/recompensa";
import { getTermoChallengeById } from "../content";
import {
  apagarLetra,
  digitarLetra,
  enviarTentativa,
  iniciarTermo,
  statusLetraTeclado,
} from "../engine";
import { TERMO_ROUTE_PATHS } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import type { StatusLetra, TermoSession } from "../types";

const XP_POR_TERMO = 50;
const OURO_POR_TERMO = 25;

const LINHAS_TECLADO = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

/**
 * "Termo Bíblico" (T-034) — clone de Wordle. Migrado de
 * `dev-pwa-biblia-game` (`app.js`, `termoGame`) — mesma recompensa da
 * tabela de tipos de desafio do legado ao vencer (50 XP/25 ouro); nenhuma
 * recompensa ao esgotar as tentativas. Recompensa passou a ser creditada
 * de verdade (antes só era texto, nunca chegava ao usuário — mesmo gap do
 * Quiz) ao ligar os "destaques do dia" (`daily/recompensa.ts`).
 */
export function TermoPlayPage() {
  const { id } = useParams<{ id: string }>();
  const challenge = id ? getTermoChallengeById(id) : undefined;
  const { user, updateUser } = useAuth();

  const [session, setSession] = useState<TermoSession | null>(null);
  const [erro, setErro] = useState("");
  const recompensaCreditadaRef = useRef(false);

  useEffect(() => {
    if (!challenge) return;
    setSession(iniciarTermo(challenge));
    setErro("");
    recompensaCreditadaRef.current = false;
  }, [challenge]);

  useEffect(() => {
    if (session?.status !== "venceu" || !challenge || !user) return;
    if (recompensaCreditadaRef.current) return;
    recompensaCreditadaRef.current = true;
    const idDeHoje = obterTermoDoDia(obterChaveDoDia()).id;
    updateUser((atual) =>
      creditarRecompensaDeJogo({
        usuario: atual,
        reward: { xp: XP_POR_TERMO, gold: OURO_POR_TERMO },
        desafioDiario: { tipo: "termo", idJogado: challenge.id, idDeHoje },
      }),
    );
  }, [session?.status, challenge, user, updateUser]);

  useEffect(() => {
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Enter") handleEnviar();
      else if (event.key === "Backspace") handleApagar();
      else if (/^[A-Za-zÀ-ÿ]$/.test(event.key)) handleLetra(event.key);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  if (!challenge) {
    return <Navigate to={TERMO_ROUTE_PATHS.lista} replace />;
  }

  if (!session) {
    return null;
  }

  function handleLetra(letra: string) {
    setSession((atual) => (atual ? digitarLetra(atual, letra) : atual));
  }

  function handleApagar() {
    setSession((atual) => (atual ? apagarLetra(atual) : atual));
  }

  function handleEnviar() {
    setSession((atual) => {
      if (!atual) return atual;
      const { session: proxima, erro: mensagemErro } = enviarTentativa(atual);
      setErro(mensagemErro ?? "");
      return proxima;
    });
  }

  const linhas: (StatusLetra | "vazio" | "digitando")[][] = [];
  for (let i = 0; i < session.maxTentativas; i++) {
    const tentativa = session.tentativas[i];
    if (tentativa) {
      linhas.push(tentativa.avaliacao);
    } else if (i === session.tentativas.length) {
      linhas.push(
        Array.from({ length: session.tamanho }, (_, index) =>
          index < session.tentativaAtual.length ? "digitando" : "vazio",
        ),
      );
    } else {
      linhas.push(Array(session.tamanho).fill("vazio"));
    }
  }

  function letraNaLinha(indexLinha: number, indexColuna: number): string {
    const tentativa = session!.tentativas[indexLinha];
    if (tentativa) return tentativa.palavra[indexColuna] ?? "";
    if (indexLinha === session!.tentativas.length) {
      return session!.tentativaAtual[indexColuna] ?? "";
    }
    return "";
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={TERMO_ROUTE_PATHS.lista}>
          <FiArrowLeft aria-hidden="true" /> Termo Bíblico
        </Link>

        <article className="dash-card" aria-labelledby="termo-titulo">
          <p className="eyebrow" id="termo-titulo">
            {challenge.referencia}
          </p>
          <p className="termo-aviso" role="status" aria-live="polite">
            {erro}
          </p>

          {session.status === "em_andamento" ? (
            <>
              <div className="termo-grade">
                {linhas.map((linha, indexLinha) => (
                  <div className="termo-linha" key={indexLinha}>
                    {linha.map((status, indexColuna) => (
                      <div
                        key={indexColuna}
                        className={`termo-celula termo-celula--${status}`}
                      >
                        {letraNaLinha(indexLinha, indexColuna)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="termo-teclado">
                {LINHAS_TECLADO.map((linha, index) => (
                  <div className="termo-teclado-linha" key={index}>
                    {index === 2 && (
                      <button
                        type="button"
                        className="termo-tecla termo-tecla--acao"
                        onClick={handleEnviar}
                      >
                        Enviar
                      </button>
                    )}
                    {[...linha].map((letra) => {
                      const status = statusLetraTeclado(session, letra);
                      return (
                        <button
                          key={letra}
                          type="button"
                          className={`termo-tecla${status ? ` termo-tecla--${status}` : ""}`}
                          onClick={() => handleLetra(letra)}
                        >
                          {letra}
                        </button>
                      );
                    })}
                    {index === 2 && (
                      <button
                        type="button"
                        className="termo-tecla termo-tecla--acao"
                        onClick={handleApagar}
                        aria-label="Apagar letra"
                      >
                        <FiDelete aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="quiz-results">
              <h1>
                {session.status === "venceu"
                  ? "Você acertou!"
                  : "Não foi dessa vez"}
              </h1>
              <p className="quiz-results-score">{session.resposta}</p>
              <p className="termo-explicacao">{challenge.explicacao}</p>
              {session.status === "venceu" && (
                <p className="quiz-results-reward">
                  +{XP_POR_TERMO} XP · +{OURO_POR_TERMO} ouro
                </p>
              )}
              <div className="quiz-results-actions">
                <Link className="primary-button" to={TERMO_ROUTE_PATHS.lista}>
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
