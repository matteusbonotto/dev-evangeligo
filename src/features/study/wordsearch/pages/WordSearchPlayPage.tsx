import { useEffect, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import "../wordsearch.css";
import { getWordSearchPuzzleById } from "../content";
import { iniciarWordSearch, selecionarCelula } from "../engine";
import { WORDSEARCH_ROUTE_PATHS } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import type { WordSearchSession } from "../types";

const XP_POR_PUZZLE = 50;
const OURO_POR_PUZZLE = 25;

/**
 * Jogo de caça-palavras (T-034): toque na primeira e na última letra de
 * cada palavra. Migrado de `dev-pwa-biblia-game` (`app.js`,
 * `selecionarCelulaCaca`) — mesma recompensa da tabela de tipos de
 * desafio do legado (50 XP por grade concluída).
 */
export function WordSearchPlayPage() {
  const { id } = useParams<{ id: string }>();
  const puzzle = id ? getWordSearchPuzzleById(id) : undefined;

  const [session, setSession] = useState<WordSearchSession | null>(null);
  const [aviso, setAviso] = useState("Toque na primeira e na última letra.");

  useEffect(() => {
    if (!puzzle) return;
    setSession(iniciarWordSearch(puzzle));
    setAviso("Toque na primeira e na última letra.");
  }, [puzzle]);

  if (!puzzle) {
    return <Navigate to={WORDSEARCH_ROUTE_PATHS.lista} replace />;
  }

  if (!session) {
    return null;
  }

  function handleCelula(index: number) {
    const { session: proxima, resultado } = selecionarCelula(session!, index);
    setSession(proxima);
    if (resultado === "aguardando_fim") {
      setAviso("Agora toque na última letra da palavra.");
    } else if (resultado === "invalida") {
      setAviso("Essa linha não forma uma das palavras. Tente novamente.");
    } else if (resultado === "palavra_encontrada" || resultado === "puzzle_concluido") {
      setAviso("Palavra encontrada!");
    }
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={WORDSEARCH_ROUTE_PATHS.lista}>
          <FiArrowLeft aria-hidden="true" /> Caça-palavras
        </Link>

        <article className="dash-card" aria-labelledby="jogo-titulo">
          <p className="eyebrow" id="jogo-titulo">
            {puzzle.titulo}
          </p>
          <p className="caca-palavras-aviso" role="status" aria-live="polite">
            {aviso}
          </p>

          {!session.concluido ? (
            <>
              <div
                className="caca-palavras-grade"
                style={{ "--tamanho": session.tamanho } as CSSProperties}
              >
                {session.grade.map((letra, index) => {
                  const encontrada = session.celulasEncontradas.includes(index);
                  const selecionada = session.inicio === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`caca-palavras-celula${encontrada ? " caca-palavras-celula--encontrada" : ""}${selecionada ? " caca-palavras-celula--selecionada" : ""}`}
                      onClick={() => handleCelula(index)}
                    >
                      {letra}
                    </button>
                  );
                })}
              </div>

              <ul className="caca-palavras-lista">
                {session.palavras.map((palavra) => {
                  const encontrada = session.encontradas.includes(
                    palavra.normalizada,
                  );
                  return (
                    <li
                      key={palavra.normalizada}
                      className={`caca-palavras-item${encontrada ? " caca-palavras-item--encontrada" : ""}`}
                    >
                      {encontrada && <FiCheck aria-hidden="true" />}
                      {palavra.exibicao}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="quiz-results">
              <h1>Caça-palavras concluído!</h1>
              <p className="quiz-results-score">
                {puzzle.palavras.length} de {puzzle.palavras.length} palavras
              </p>
              <p className="quiz-results-reward">
                +{XP_POR_PUZZLE} XP · +{OURO_POR_PUZZLE} ouro
              </p>
              <div className="quiz-results-actions">
                <Link className="primary-button" to={WORDSEARCH_ROUTE_PATHS.lista}>
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
