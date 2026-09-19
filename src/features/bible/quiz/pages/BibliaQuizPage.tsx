import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiHeart } from "react-icons/fi";
import "../../../study/study.css";
import { AppShell } from "../../../../shared/components/AppShell";
import { getLivroByCodigo } from "../../data/livros";
import { buildCapitulosPath, buildLeituraPath } from "../../routePaths";
import { useAuth } from "../../../authentication/context/AuthContext";
import { temEscudoDaFe } from "../../../rpg/bonus";
import { tocarSom } from "../../../../shared/sons";
import {
  calculateQuizReward,
  getCurrentQuestion,
  startQuizSession,
  submitAnswer,
  summarizeQuizSession,
  type QuizSessionState,
} from "../../../study/quiz/engine";
import type { AnsweredQuestion, QuizAnswer } from "../../../study/quiz/types";
import type { QuizQuestion } from "../../../study/quiz/schemas";
import { getQuizCapituloBiblia, getQuizLivroBiblia } from "../content";
import {
  marcarQuizCapituloAprovado,
  marcarQuizLivroAprovado,
  quizCapituloAprovado,
  quizLivroAprovado,
} from "../progresso";

type Phase = "respondendo" | "feedback";

/**
 * Quiz por capítulo OU por livro da Bíblia (T-045, prova de conceito com o
 * livro de Rute — ver `IA/docs/quiz-biblico-plano.md`). Reaproveita o motor
 * genérico de `study/quiz/engine.ts` (TypeScript puro, sem depender de
 * `study/` além do tipo) — mesma UI/fluxo de `QuizPage.tsx` (pergunta →
 * feedback → resultado), copiado e adaptado aqui em vez de compartilhado
 * (os componentes internos de `QuizPage.tsx` não são exportados, e a volta/
 * links de resultado apontam pra lugares diferentes — trilha vs. Bíblia).
 *
 * Decisão de produto (seção 5 do plano): o quiz é um SELO PARALELO
 * ("compreensão confirmada"), nunca um requisito pra o capítulo contar como
 * lido — isso continua sendo só a rolagem de tela (`bible/progresso.ts`).
 * Mesma limitação já documentada em `QuizPage.tsx`: XP/ouro exibidos não são
 * creditados a nenhum progresso salvo ainda (não existe `user_progress`
 * server-side pra isso, mesmo gap do quiz de trilha).
 */
export function BibliaQuizPage() {
  const { livroCodigo, capitulo: capituloParam } = useParams<{
    livroCodigo: string;
    capitulo?: string;
  }>();
  const { user } = useAuth();

  const livro = livroCodigo ? getLivroByCodigo(livroCodigo) : undefined;
  const capitulo = capituloParam ? Number(capituloParam) : null;
  const ehQuizDeLivro = capitulo === null;

  const quiz = livro
    ? ehQuizDeLivro
      ? getQuizLivroBiblia(livro.order)
      : getQuizCapituloBiblia(livro.order, capitulo)
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

  if (!livro || !quiz || !session) {
    return <Navigate to="/biblia" replace />;
  }

  const voltarPara = ehQuizDeLivro
    ? buildCapitulosPath(livro.codigo)
    : buildLeituraPath(livro.codigo, capitulo as number);

  const currentQuestion = getCurrentQuestion(session);

  function selectSingleOrBoolean(answer: QuizAnswer) {
    setDraft(answer);
  }

  function toggleMultiOption(optionId: string) {
    setDraft((previous) => {
      const previousIds = previous?.type === "multipla_selecao" ? previous.optionIds : [];
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

    if (next.status === "sem_coracoes") {
      tocarSom("falha");
    } else if (next.status === "concluido") {
      tocarSom("concluido");
      if (!livro) return;
      if (ehQuizDeLivro) {
        marcarQuizLivroAprovado(livro.codigo);
      } else {
        marcarQuizCapituloAprovado(livro.codigo, capitulo as number);
      }
    } else {
      tocarSom(entry.correct ? "sucesso" : "erro");
    }
  }

  function handleContinue() {
    setDraft(null);
    setLastFeedback(null);
    setPhase("respondendo");
  }

  const isMultiDraftEmpty = draft?.type === "multipla_selecao" && draft.optionIds.length === 0;
  const canSubmit = draft !== null && !isMultiDraftEmpty;

  return (
    <AppShell>
      <div className="dashboard quiz-page">
        <Link className="back-link" to={voltarPara}>
          <FiArrowLeft aria-hidden="true" />{" "}
          {ehQuizDeLivro ? livro.nome : `${livro.nome} ${capitulo}`}
        </Link>

        <article className="dash-card quiz-content" aria-labelledby="biblia-quiz-title">
          <div className="quiz-header">
            <p className="eyebrow" id="biblia-quiz-title">
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
                  className={index < session.hearts ? "heart-full" : "heart-empty"}
                />
              ))}
            </div>
          </div>

          {phase === "respondendo" && session.status === "em_andamento" && currentQuestion && (
            <BibliaQuestionCard
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
            <BibliaFeedbackCard
              question={lastFeedback.question}
              entry={lastFeedback.entry}
              onContinue={handleContinue}
              isLastAction={session.status !== "em_andamento"}
            />
          )}

          {phase === "respondendo" && session.status !== "em_andamento" && (
            <BibliaResultsCard
              session={session}
              voltarPara={voltarPara}
              aprovado={
                ehQuizDeLivro
                  ? quizLivroAprovado(livro.codigo)
                  : quizCapituloAprovado(livro.codigo, capitulo as number)
              }
            />
          )}
        </article>
      </div>
    </AppShell>
  );
}

function BibliaQuestionCard({
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
        <div className="quiz-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={draft?.type === "escolha_unica" && draft.optionId === option.id}
              className={`quiz-option${draft?.type === "escolha_unica" && draft.optionId === option.id ? " quiz-option--selected" : ""}`}
              onClick={() => onSelectSingleOrBoolean({ type: "escolha_unica", optionId: option.id })}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {question.type === "verdadeiro_falso" && (
        <div className="quiz-options" role="radiogroup" aria-label={question.prompt}>
          {[
            { value: true, label: "Verdadeiro" },
            { value: false, label: "Falso" },
          ].map((choice) => (
            <button
              key={String(choice.value)}
              type="button"
              role="radio"
              aria-checked={draft?.type === "verdadeiro_falso" && draft.value === choice.value}
              className={`quiz-option${draft?.type === "verdadeiro_falso" && draft.value === choice.value ? " quiz-option--selected" : ""}`}
              onClick={() => onSelectSingleOrBoolean({ type: "verdadeiro_falso", value: choice.value })}
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
              draft?.type === "multipla_selecao" && draft.optionIds.includes(option.id);
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

      <button className="primary-button full" type="button" disabled={!canSubmit} onClick={onSubmit}>
        Responder
      </button>
    </div>
  );
}

function BibliaFeedbackCard({
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
    <div className={`quiz-feedback${entry.correct ? " quiz-feedback--correct" : " quiz-feedback--incorrect"}`}>
      <p className="quiz-feedback-title">
        {entry.correct ? (
          "Correto!"
        ) : entry.shieldBlocked ? (
          <>
            <FiHeart aria-hidden="true" /> Você errou, mas o Escudo da Fé protegeu seu coração.
          </>
        ) : (
          "Não foi dessa vez."
        )}
      </p>
      <p className="quiz-feedback-explanation">{question.explanation}</p>
      <p className="aula-ref-chip quiz-feedback-ref">
        <FiBookOpen aria-hidden="true" /> {question.bibleReference.display}
      </p>
      <button className="primary-button full" type="button" onClick={onContinue}>
        {isLastAction ? "Ver resultado" : "Próxima pergunta"}
      </button>
    </div>
  );
}

function BibliaResultsCard({
  session,
  voltarPara,
  aprovado,
}: {
  session: QuizSessionState;
  voltarPara: string;
  aprovado: boolean;
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
      {aprovado && (
        <p className="quiz-results-reward">
          <FiCheckCircle aria-hidden="true" /> Selo de compreensão conquistado
        </p>
      )}
      <div className="quiz-results-actions">
        <Link className="primary-button" to={voltarPara}>
          Voltar à leitura
        </Link>
      </div>
    </div>
  );
}
