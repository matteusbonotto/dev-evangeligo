import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import "../study.css";
import { getAulasByTrilha, TRILHAS } from "../content";
import { buildAulaPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import {
  listarAulasAdicionais,
  listarTrilhasAdicionais,
  type AulaCatalogoLeitura,
  type TrilhaCatalogoLeitura,
} from "../catalogoRemoto";

/**
 * Lista as 5 trilhas de estudo estáticas (RF-07) com as aulas de cada uma
 * (RF-08), somadas a trilhas/aulas ADICIONAIS criadas via painel admin
 * (T-015/ADR-056, tabelas `trilhas_catalogo`/`aulas_catalogo`) — quando o
 * Supabase não está configurado (modo demonstração) ou a busca falha, a
 * lista adicional fica vazia e a tela segue mostrando só o conteúdo
 * estático, exatamente como antes.
 */
export function TrilhasPage() {
  const [trilhasAdicionais, setTrilhasAdicionais] = useState<TrilhaCatalogoLeitura[]>([]);
  const [aulasAdicionais, setAulasAdicionais] = useState<AulaCatalogoLeitura[]>([]);

  useEffect(() => {
    let ativo = true;
    listarTrilhasAdicionais().then((lista) => {
      if (ativo) setTrilhasAdicionais(lista);
    });
    listarAulasAdicionais().then((lista) => {
      if (ativo) setAulasAdicionais(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const trilhasCombinadas = [
    ...TRILHAS.map((trilha) => ({
      id: trilha.id,
      slug: trilha.slug,
      order: trilha.order,
      title: trilha.title,
      description: trilha.description,
      verseFocusDisplay: trilha.verseFocus?.display,
      aulas: getAulasByTrilha(trilha.id).map((aula) => ({
        id: aula.id,
        order: aula.order,
        title: aula.title,
        estimatedMinutes: aula.estimatedMinutes,
      })),
    })),
    ...trilhasAdicionais.map((trilha) => ({
      id: trilha.id,
      slug: trilha.slug,
      order: trilha.order,
      title: trilha.title,
      description: trilha.description,
      verseFocusDisplay: trilha.verse_focus?.display,
      aulas: aulasAdicionais
        .filter((aula) => aula.trilha_id === trilha.id)
        .map((aula) => ({
          id: aula.id,
          order: aula.order,
          title: aula.title,
          estimatedMinutes: aula.estimated_minutes,
        }))
        .sort((a, b) => a.order - b.order),
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <AppShell>
      <div className="dashboard">
        <section
          className="dash-card trilhas-intro"
          aria-labelledby="trilhas-title"
        >
          <p className="eyebrow">
            <FiBookOpen aria-hidden="true" /> Estudo bíblico
          </p>
          <h1 id="trilhas-title">Trilhas de estudo</h1>
          <p className="trilha-card-description">
            Cinco trilhas de teologia reformada, do fundamento da Reforma à vida
            cristã prática. Escolha uma para começar.
          </p>
        </section>

        <div className="dash-grid">
          {trilhasCombinadas.map((trilha) => (
            <section
              key={trilha.id}
              className="dash-card trilha-card"
              aria-labelledby={`trilha-${trilha.id}-title`}
            >
              {trilha.verseFocusDisplay && (
                <p className="eyebrow">{trilha.verseFocusDisplay}</p>
              )}
              <h2 id={`trilha-${trilha.id}-title`}>{trilha.title}</h2>
              <p className="trilha-card-description">{trilha.description}</p>

              <ul className="trilha-aula-list">
                {trilha.aulas.map((aula) => (
                  <li key={aula.id} className="trilha-aula-item">
                    <Link to={buildAulaPath(trilha.slug, aula.id)}>
                      <span className="trilha-aula-order" aria-hidden="true">
                        {aula.order}
                      </span>
                      <span className="trilha-aula-item-title">
                        {aula.title}
                      </span>
                      <span className="trilha-aula-item-minutes">
                        {aula.estimatedMinutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
