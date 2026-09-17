import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiHelpCircle } from "react-icons/fi";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { PERGUNTAS_FAQ } from "../content";

/**
 * FAQ (T-077) — pedido explícito do usuário, mesma rodada do popup de
 * boas-vindas e do tour guiado. Acordeão simples (1 pergunta aberta por
 * vez), mesmo espírito visual de `ApologeticaPage.tsx` sem os filtros
 * (aqui são só 7 perguntas, não precisa).
 */
export function FaqPage() {
  const [abertaId, setAbertaId] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.profile}>
          <FiArrowLeft aria-hidden="true" /> Perfil
        </Link>

        <section className="dash-card" aria-labelledby="faq-title">
          <p className="eyebrow">
            <FiHelpCircle aria-hidden="true" /> Ajuda
          </p>
          <h1 id="faq-title">Perguntas frequentes</h1>

          <div className="faq-lista">
            {PERGUNTAS_FAQ.map((item) => {
              const aberta = abertaId === item.id;
              const headerId = `faq-header-${item.id}`;
              const painelId = `faq-painel-${item.id}`;
              return (
                <div key={item.id} className="faq-item">
                  <h2 className="faq-item-titulo-wrap">
                    <button
                      type="button"
                      id={headerId}
                      className="faq-item-header"
                      aria-expanded={aberta}
                      aria-controls={painelId}
                      onClick={() => setAbertaId(aberta ? null : item.id)}
                    >
                      <span>{item.pergunta}</span>
                      {aberta ? (
                        <FiChevronUp aria-hidden="true" />
                      ) : (
                        <FiChevronDown aria-hidden="true" />
                      )}
                    </button>
                  </h2>
                  {aberta && (
                    <p
                      id={painelId}
                      role="region"
                      aria-labelledby={headerId}
                      className="faq-item-resposta"
                    >
                      {item.resposta}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
