import { Link } from "react-router-dom";
import { FiGrid, FiLayout, FiType } from "react-icons/fi";
import "../study.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";

const EXERCICIOS = [
  {
    to: ROUTE_PATHS.cacaPalavras,
    titulo: "Caça-palavras",
    descricao: "Encontre palavras bíblicas escondidas na grade.",
    Icon: FiGrid,
  },
  {
    to: ROUTE_PATHS.termo,
    titulo: "Termo Bíblico",
    descricao: "Descubra a palavra bíblica em até 6 tentativas.",
    Icon: FiType,
  },
  {
    to: ROUTE_PATHS.quebraCabeca,
    titulo: "Quebra-cabeça",
    descricao: "Reordene as palavras para reconstruir o versículo.",
    Icon: FiLayout,
  },
] as const;

/** Hub de exercícios (T-034) — ponto de partida para os desafios de palavras. */
export function ExerciciosPage() {
  return (
    <AppShell>
      <div className="dashboard">
        <section className="dash-card" aria-labelledby="exercicios-title">
          <p className="eyebrow">Praticar</p>
          <h1 id="exercicios-title">Exercícios</h1>
          <p className="trilha-card-description">
            Fixe o que aprendeu nas trilhas com desafios de palavras.
          </p>
        </section>

        <div className="dash-grid">
          {EXERCICIOS.map(({ to, titulo, descricao, Icon }) => (
            <Link key={to} className="dash-card trilha-card" to={to}>
              <p className="eyebrow">
                <Icon aria-hidden="true" /> Exercício
              </p>
              <h2>{titulo}</h2>
              <p className="trilha-card-description">{descricao}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
