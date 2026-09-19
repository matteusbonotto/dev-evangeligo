import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiSunrise,
  FiTarget,
} from "react-icons/fi";
import "../devotional.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { getLivroByOrder } from "../../bible/data/livros";
import { obterCapituloTraduzido } from "../../bible/traducoes";
import { obterTraducaoPreferida } from "../../bible/traducaoPreferida";
import { DEVOCIONAIS } from "../content";
import { devocionalLido, marcarDevocionalLido, obterDevocionaisLidos } from "../progresso";

/**
 * Feed de Devocionais (T-013 — "Publicar reflexões com versículos").
 * Sem equivalente no app legado (ver header de `content.ts`); estrutura de
 * tela (accordion "expande no lugar", card + badge de lido) segue o mesmo
 * padrão já validado em `ApologeticaPage` (ADR de Apologética), pra manter
 * consistência visual entre as duas features de conteúdo do app.
 *
 * O texto do versículo é buscado ao vivo (mesma fonte/tradução preferida já
 * usada na leitura bíblica) só quando o card é expandido — evita 12+
 * requisições simultâneas ao abrir a tela.
 */
export function FeedDevocionaisPage() {
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [lidos, setLidos] = useState<Set<string>>(
    () => new Set(obterDevocionaisLidos()),
  );
  const [textos, setTextos] = useState<Record<string, string | null>>({});

  function alternarCard(id: string) {
    if (abertoId === id) {
      setAbertoId(null);
      return;
    }
    setAbertoId(id);
    if (!devocionalLido(id)) {
      marcarDevocionalLido(id);
      setLidos((atual) => new Set(atual).add(id));
    }
    if (!(id in textos)) {
      const devocional = DEVOCIONAIS.find((entry) => entry.id === id);
      const livro = devocional && getLivroByOrder(devocional.referencia.livroOrder);
      if (!devocional || !livro) {
        setTextos((atual) => ({ ...atual, [id]: null }));
        return;
      }
      obterCapituloTraduzido(livro, devocional.referencia.capitulo, obterTraducaoPreferida())
        .then((versiculos) => {
          setTextos((atual) => ({
            ...atual,
            [id]: versiculos[devocional.referencia.versiculo - 1] ?? null,
          }));
        })
        .catch(() => {
          setTextos((atual) => ({ ...atual, [id]: null }));
        });
    }
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Painel
        </Link>

        <section className="dash-card" aria-labelledby="devocionais-title">
          <p className="eyebrow">
            <FiSunrise aria-hidden="true" /> Feed de Devocionais
          </p>
          <h1 id="devocionais-title">Devocionais</h1>
          <p className="devo-intro">
            Reflexões curtas com base bíblica, para estudar no seu ritmo — não
            é preciso ler em ordem nem em um dia só.
          </p>
        </section>

        <div className="devo-lista">
          {DEVOCIONAIS.map((devocional) => {
            const aberto = abertoId === devocional.id;
            const lido = lidos.has(devocional.id);
            const headerId = `devo-header-${devocional.id}`;
            const painelId = `devo-painel-${devocional.id}`;
            const texto = textos[devocional.id];

            return (
              <div
                key={devocional.id}
                className={`devo-card${aberto ? " devo-card--aberta" : ""}`}
              >
                <h3 className="apol-card-titulo-wrap">
                  <button
                    type="button"
                    id={headerId}
                    className="devo-card-header"
                    aria-expanded={aberto}
                    aria-controls={painelId}
                    onClick={() => alternarCard(devocional.id)}
                  >
                    <span className="devo-card-header-esquerda">
                      <FiBookOpen className="devo-card-icone" aria-hidden="true" />
                      <span>
                        <span className="devo-card-titulo">{devocional.titulo}</span>
                        <span className="devo-card-meta">
                          <span className="devo-card-tema">{devocional.tema}</span>
                          <span className="devo-card-referencia">
                            {devocional.referencia.display}
                          </span>
                          {lido && (
                            <FiCheckCircle
                              className="devo-badge-lido"
                              aria-label="Já lido"
                            />
                          )}
                        </span>
                      </span>
                    </span>
                    {aberto ? (
                      <FiChevronUp className="devo-chevron" aria-hidden="true" />
                    ) : (
                      <FiChevronDown className="devo-chevron" aria-hidden="true" />
                    )}
                  </button>
                </h3>

                {aberto && (
                  <div
                    id={painelId}
                    role="region"
                    aria-labelledby={headerId}
                    className="devo-card-conteudo"
                  >
                    {texto && (
                      <blockquote className="devo-versiculo">
                        &ldquo;{texto}&rdquo; — {devocional.referencia.display}
                      </blockquote>
                    )}

                    <div className="devo-reflexao">
                      {devocional.reflexao.map((paragrafo, indice) => (
                        <p key={indice}>{paragrafo}</p>
                      ))}
                    </div>

                    <div className="devo-aplicacao">
                      <p className="devo-aplicacao-titulo">
                        <FiTarget aria-hidden="true" /> Para hoje
                      </p>
                      <p className="devo-aplicacao-texto">{devocional.aplicacao}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
