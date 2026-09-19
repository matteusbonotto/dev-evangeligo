import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import "../study.css";
import { getAulaById, getAulasByTrilha, getTrilhaBySlug } from "../content";
import { buildAulaPath, buildQuizPath, buildTrilhaPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import type { Aula, BibleReference, Trilha } from "../schemas";
import {
  listarAulasAdicionais,
  listarTrilhasAdicionais,
} from "../catalogoRemoto";

interface AulaExibicao {
  id: string;
  order: number;
  title: string;
  summary: string;
  bibleReferences: BibleReference[];
  estimatedMinutes: number;
  quizId?: string;
}

/**
 * Detalhe de uma aula (RF-08): resumo doutrinário, referências bíblicas e
 * um slot reservado para o quiz da aula. Busca primeiro no conteúdo
 * estático (síncrono, sem tela de carregamento — caminho de sempre);
 * quando não encontra, tenta as trilhas/aulas ADICIONAIS do painel admin
 * (T-015/ADR-056, `trilhas_catalogo`/`aulas_catalogo`) antes de redirecionar.
 */
export function AulaPage() {
  const { trilhaSlug, aulaId } = useParams<{
    trilhaSlug: string;
    aulaId: string;
  }>();

  const trilhaEstatica = trilhaSlug ? getTrilhaBySlug(trilhaSlug) : undefined;
  const aulaEstatica = aulaId ? getAulaById(aulaId) : undefined;
  const encontradoEstatico =
    trilhaEstatica && aulaEstatica && aulaEstatica.trilhaId === trilhaEstatica.id;

  const [buscaRemota, setBuscaRemota] = useState<
    "pulando" | "carregando" | { trilha: Trilha; aulas: AulaExibicao[]; aula: AulaExibicao } | "nao-encontrado"
  >(encontradoEstatico ? "pulando" : "carregando");

  useEffect(() => {
    if (encontradoEstatico || !trilhaSlug || !aulaId) return;
    let ativo = true;
    Promise.all([listarTrilhasAdicionais(), listarAulasAdicionais()]).then(
      ([trilhas, aulas]) => {
        if (!ativo) return;
        const trilha = trilhas.find((t) => t.slug === trilhaSlug);
        const aulasDaTrilha = trilha
          ? aulas
              .filter((a) => a.trilha_id === trilha.id)
              .map((a) => ({
                id: a.id,
                order: a.order,
                title: a.title,
                summary: a.summary,
                bibleReferences: a.bible_references,
                estimatedMinutes: a.estimated_minutes,
                quizId: a.quiz_id ?? undefined,
              }))
              .sort((x, y) => x.order - y.order)
          : [];
        const aula = aulasDaTrilha.find((a) => a.id === aulaId);
        if (!trilha || !aula) {
          setBuscaRemota("nao-encontrado");
          return;
        }
        setBuscaRemota({
          trilha: {
            id: trilha.id,
            slug: trilha.slug,
            order: trilha.order,
            title: trilha.title,
            description: trilha.description,
            verseFocus: trilha.verse_focus ?? undefined,
          },
          aulas: aulasDaTrilha,
          aula,
        });
      },
    );
    return () => {
      ativo = false;
    };
  }, [encontradoEstatico, trilhaSlug, aulaId]);

  if (encontradoEstatico) {
    const aulasDaTrilha = getAulasByTrilha(trilhaEstatica.id);
    return (
      <AulaVisualizacao
        trilha={trilhaEstatica}
        aula={aulaEstatica}
        aulas={aulasDaTrilha}
      />
    );
  }

  if (buscaRemota === "carregando") {
    return (
      <AppShell>
        <main className="loading-screen">Carregando...</main>
      </AppShell>
    );
  }

  if (buscaRemota === "nao-encontrado" || buscaRemota === "pulando") {
    return <Navigate to="/trilhas" replace />;
  }

  return (
    <AulaVisualizacao
      trilha={buscaRemota.trilha}
      aula={buscaRemota.aula}
      aulas={buscaRemota.aulas}
    />
  );
}

function AulaVisualizacao({
  trilha,
  aula,
  aulas,
}: {
  trilha: Pick<Trilha, "slug" | "title">;
  aula: Aula | AulaExibicao;
  aulas: (Aula | AulaExibicao)[];
}) {
  const indiceAtual = aulas.findIndex((item) => item.id === aula.id);
  const proxima = aulas[indiceAtual + 1];

  return (
    <AppShell>
      <div className="dashboard aula-page">
        <Link className="back-link" to={buildTrilhaPath(trilha.slug)}>
          <FiArrowLeft aria-hidden="true" /> {trilha.title}
        </Link>

        <article
          className="dash-card aula-content"
          aria-labelledby="aula-title"
        >
          <p className="eyebrow">
            Aula {aula.order} de {aulas.length} ·{" "}
            {aula.estimatedMinutes} min
          </p>
          <h1 id="aula-title">{aula.title}</h1>
          <p className="aula-summary">{aula.summary}</p>

          <section aria-labelledby="aula-refs-title">
            <p className="eyebrow" id="aula-refs-title">
              <FiBookOpen aria-hidden="true" /> Referências bíblicas
            </p>
            <ul className="aula-ref-list">
              {aula.bibleReferences.map((ref) => (
                <li key={ref.display} className="aula-ref-chip">
                  {ref.display}
                </li>
              ))}
            </ul>
          </section>

          {aula.quizId ? (
            <Link
              className="aula-quiz-slot aula-quiz-slot--available"
              to={buildQuizPath(trilha.slug, aula.id)}
            >
              <FiCheckCircle aria-hidden="true" />
              <p>Fazer o quiz desta aula</p>
            </Link>
          ) : (
            <div className="aula-quiz-slot">
              <FiCheckCircle aria-hidden="true" />
              <p>O quiz desta aula ainda não está disponível.</p>
            </div>
          )}

          {proxima && (
            <Link
              className="primary-button"
              to={buildAulaPath(trilha.slug, proxima.id)}
            >
              Próxima aula: {proxima.title}
            </Link>
          )}
        </article>
      </div>
    </AppShell>
  );
}
