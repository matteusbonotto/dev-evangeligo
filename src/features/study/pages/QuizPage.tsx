import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiHeart, FiShield } from "react-icons/fi";
import "../study.css";
import { getAulaById, getTrilhaBySlug } from "../content";
import { buildAulaPath, buildTrilhaPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { temEscudoDaFe } from "../../rpg/bonus";
import { getQuizByAulaId } from "../quiz/content";
import {
  calculateQuizReward,
  getCurrentQuestion,
  startQuizSession,
  submitAnswer,
  summarizeQuizSession,
  type QuizSessionState,
} from "../quiz/engine";
import type { AnsweredQuestion, QuizAnswer } from "../quiz/types";
import type { QuizQuestion } from "../quiz/schemas";

type Phase = "respondendo" | "feedback";

/**
 * Tela de quiz de uma aula (T-008, RF-08/RF-11): pergunta → alternativas →
 * feedback imediato (correto/errado) → explicação + referência bíblica →
 * próximo (fluxo documentado em `IA/docs/ux-ui.md`, seção "Quiz").
 *
 * Ainda sem persistência real: hearts/XP/ouro exibidos ao final são
 * calculados pelo motor puro (`../quiz/engine.ts`) mas não são creditados
 * a nenhum progresso salvo — não existe `user_progress` no banco ainda
 * (ver `IA/docs/database.md`). O Escudo da Fé (T-010) já lê o slot
 * `escudo` de verdade (`temEscudoDaFe`, `src/features/rpg/bonus.ts`) —
 * primeiro bônus de peça com um consumidor de gameplay alcançável hoje.
 */
export function QuizPage() {
  const { trilhaSlug, aulaId } = useParams<{
    trilhaSlug: string;
    aulaId: string;
  }>();
  const { user } = useAuth();

  const trilha = trilhaSlug ? getTrilhaBySlug(trilhaSlug) : undefined;
  const aula = aulaId ? getAulaById(aulaId) : undefined;
  const quiz =
    trilha && aula && aula.trilhaId === trilha.id && aula.quizId
      ? getQuizByAulaId(aula.id)
      : undefined;

  const [session, setSession] = useState<QuizSessionState | null>(() =>
    quiz
      ? startQuizSession({
          quiz,
          hasShieldOfFaith: user ? temEscudoDaFe(user.armor) : false,
        })
      : null,
  );
  const [phase, setPhase] = useState<Phase>("respondendo");
  const [draft, setDraft] = useState<QuizAnswer | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    question: QuizQuestion;
    entry: AnsweredQuestion;
  } | null>(null);

  if (!trilha || !aula || !quiz || !session) {
    return <Navigate to="/trilhas" replace />;
  }

  const currentQuestion = getCurrentQuestion(session);

  function selectSingleOrBoolean(answer: QuizAnswer) {
    setDraft(answer);
  }

  function toggleMultiOption(optionId: string) {
    setDraft((previous) => {
      const previousIds =
        previous?.type === "multipla_selecao" ? previous.optionIds : [];
      const next = previousIds.includes(optionId)
        ? previousIds.filter((id) => id !== optionId)
        : [...previousIds, optionId];
      return { type: "multipla_selecao", optionIds: next };
    });
  }

  function handleSubmit() {
    if (!draft || !currentQuestion || !session) return;
    const next = submitAnswer(session, draft);
    const entry = next.answered[next.answered.length - 1];
    setLastFeedback({ question: currentQuestion, entry });
    setSession(next);
    setPhase("feedback");
  }

  function handleContinue() {
    setDraft(null);
    setLastFeedback(null);
    setPhase("respondendo");
  }

  const isMultiDraftEmpty =
    draft?.type === "multipla_selecao" && draft.optionIds.length === 0;
  const canSubmit = draft !== null && !isMultiDraftEmpty;

  return (
    <AppShell>
      <div className="dashboard quiz-page">
        <Link className="back-link" to={buildAulaPath(trilha.slug, aula.id)}>
          <FiArrowLeft aria-hidden="true" /> {aula.title}
        </Link>

        <article
          className="dash-card quiz-content"
          aria-labelledby="quiz-title"
        >
          <div className="quiz-header">
            <p className="eyebrow" id="quiz-title">
              {quiz.title}
            </p>
            <div
              className="quiz-hearts"
              aria-label={`${session.hearts} de ${session.maxHearts} corações restantes`}
            >
              {Array.from({ length: session.maxHearts }, (_, index) => (
                <FiHeart
                  key={index}
                  aria-hidden="true"
                  className={
                    index < session.hearts ? "heart-full" : "heart-empty"
                  }
                />
              ))}
            </div>
          </div>

          {phase === "respondendo" &&
            session.status === "em_andamento" &&
            currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionNumber={session.currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                draft={draft}
                onSelectSingleOrBoolean={selectSingleOrBoolean}
                onToggleMulti={toggleMultiOption}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
              />
            )}

          {phase === "feedback" && lastFeedback && (
            <FeedbackCard
              question={lastFeedback.question}
              entry={lastFeedback.entry}
              onContinue={handleContinue}
              isLastAction={session.status !== "em_andamento"}
            />
          )}

          {phase === "respondendo" && session.status !== "em_andamento" && (
            <ResultsCard trilha={trilha} aula={aula} session={session} />
          )}
        </article>
      </div>
    </AppShell>
  );
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  draft,
  onSelectSingleOrBoolean,
  onToggleMulti,
  onSubmit,
  canSubmit,
}: {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  draft: QuizAnswer | null;
  onSelectSingleOrBoolean: (answer: QuizAnswer) => void;
  onToggleMulti: (optionId: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  return (
    <div>
      <p className="quiz-progress">
        Pergunta {questionNumber} de {totalQuestions}
      </p>
      <h1 className="quiz-prompt">{question.prompt}</h1>

      {question.type === "escolha_unica" && (
        <div
          className="quiz-options"
          role="radiogroup"
          aria-label={question.prompt}
        >
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={
                draft?.type === "escolha_unica" && draft.optionId === option.id
              }
              className={`quiz-option${draft?.type === "escolha_unica" && draft.optionId === option.id ? " quiz-option--selected" : ""}`}
              onClick={() =>
                onSelectSingleOrBoolean({
                  type: "escolha_unica",
                  optionId: option.id,
                })
              }
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {question.type === "verdadeiro_falso" && (
        <div
          className="quiz-options"
          role="radiogroup"
          aria-label={question.prompt}
        >
          {[
            { value: true, label: "Verdadeiro" },
            { value: false, label: "Falso" },
          ].map((choice) => (
            <button
              key={String(choice.value)}
              type="button"
              role="radio"
              aria-checked={
                draft?.type === "verdadeiro_falso" &&
                draft.value === choice.value
              }
              className={`quiz-option${draft?.type === "verdadeiro_falso" && draft.value === choice.value ? " quiz-option--selected" : ""}`}
              onClick={() =>
                onSelectSingleOrBoolean({
                  type: "verdadeiro_falso",
                  value: choice.value,
                })
              }
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {question.type === "multipla_selecao" && (
        <div className="quiz-options" role="group" aria-label={question.prompt}>
          <p className="quiz-hint">Selecione todas as opções corretas.</p>
          {question.options.map((option) => {
            const checked =
              draft?.type === "multipla_selecao" &&
              draft.optionIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                className={`quiz-option${checked ? " quiz-option--selected" : ""}`}
                onClick={() => onToggleMulti(option.id)}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      <button
        className="primary-button full"
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        Responder
      </button>
    </div>
  );
}

function FeedbackCard({
  question,
  entry,
  onContinue,
  isLastAction,
}: {
  question: QuizQuestion;
  entry: AnsweredQuestion;
  onContinue: () => void;
  isLastAction: boolean;
}) {
  return (
    <div
      className={`quiz-feedback${entry.correct ? " quiz-feedback--correct" : " quiz-feedback--incorrect"}`}
    >
      <p className="quiz-feedback-title">
        {entry.correct ? (
          "Correto!"
        ) : entry.shieldBlocked ? (
          <>
            <FiShield aria-hidden="true" /> Você errou, mas o Escudo da Fé
            protegeu seu coração.
          </>
        ) : (
          "Não foi dessa vez."
        )}
      </p>
      <p className="quiz-feedback-explanation">{question.explanation}</p>
      <p className="aula-ref-chip quiz-feedback-ref">
        <FiBookOpen aria-hidden="true" /> {question.bibleReference.display}
      </p>
      <button
        className="primary-button full"
        type="button"
        onClick={onContinue}
      >
        {isLastAction ? "Ver resultado" : "Próxima pergunta"}
      </button>
    </div>
  );
}

function ResultsCard({
  trilha,
  aula,
  session,
}: {
  trilha: { slug: string };
  aula: { id: string; title: string };
  session: QuizSessionState;
}) {
  const result = summarizeQuizSession(session);
  const reward = calculateQuizReward(result);

  return (
    <div className="quiz-results">
      <h1>{result.passed ? "Quiz concluído!" : "Você ficou sem corações"}</h1>
      <p className="quiz-results-score">
        {result.correctCount} de {result.totalQuestions} corretas
        {result.perfect && " — perfeito!"}
      </p>
      {result.passed ? (
        <p className="quiz-results-reward">
          +{reward.xp} XP · +{reward.gold} ouro
        </p>
      ) : (
        <p className="quiz-results-reward quiz-results-reward--empty">
          Sem recompensa desta vez — tente novamente.
        </p>
      )}
      <div className="quiz-results-actions">
        <Link
          className="secondary-button"
          to={buildAulaPath(trilha.slug, aula.id)}
        >
          Voltar à aula
        </Link>
        <Link className="primary-button" to={buildTrilhaPath(trilha.slug)}>
          Ver trilha
        </Link>
      </div>
    </div>
  );
}
