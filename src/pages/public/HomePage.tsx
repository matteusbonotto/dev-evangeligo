import {
  FiBookOpen,
  FiCheckCircle,
  FiHeart,
  FiPlay,
  FiShield,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/routePaths";
import { useAuth } from "../../features/authentication/context/AuthContext";
import { BrandMark } from "../../shared/components/BrandMark";

const principles = [
  {
    icon: FiBookOpen,
    title: "Palavra em primeiro lugar",
    description:
      "Leitura e estudo continuam acessíveis, sem barreiras de gamificação.",
  },
  {
    icon: FiCheckCircle,
    title: "Constância acolhedora",
    description: "Metas pequenas ajudam a criar hábito sem culpa ou punição.",
  },
  {
    icon: FiHeart,
    title: "Comunhão saudável",
    description:
      "Recursos sociais seguros, privados por padrão e com moderação.",
  },
  {
    icon: FiShield,
    title: "Privacidade real",
    description:
      "Seus dados são protegidos por autorização no banco, não só na tela.",
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const { signInDemo } = useAuth();

  function handleDemo() {
    signInDemo();
    navigate(ROUTE_PATHS.dashboard);
  }

  return (
    <main>
      <header className="site-header">
        <Link className="brand" to={ROUTE_PATHS.home}>
          <BrandMark />
        </Link>
        <nav className="header-nav" aria-label="Navegação principal">
          <Link className="header-link" to={ROUTE_PATHS.signIn}>
            Entrar
          </Link>
          <Link className="primary-button small" to={ROUTE_PATHS.signUp}>
            Começar
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Cresça um passo por dia</p>
          <h1>Uma jornada bíblica que respeita o seu ritmo.</h1>
          <p>
            Leitura, estudo e práticas cristãs reunidos em uma experiência
            serena, segura e feita para a constância.
          </p>
          <div className="hero-actions">
            <Link
              className="primary-button inline-button"
              to={ROUTE_PATHS.signUp}
            >
              Começar minha jornada
            </Link>
            <Link
              className="secondary-button inline-button"
              to={ROUTE_PATHS.signIn}
            >
              Já tenho conta
            </Link>
            <button
              className="demo-button inline-button"
              type="button"
              onClick={handleDemo}
            >
              <FiPlay aria-hidden="true" />
              Ver demonstração
            </button>
          </div>
        </div>
        <div className="verse-card">
          <span className="verse-label">Leitura de hoje</span>
          <blockquote>
            "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."
          </blockquote>
          <cite>Salmos 119:105</cite>
          <div className="progress-line">
            <i />
          </div>
          <small>
            O conteúdo bíblico será publicado somente após validação de licença.
          </small>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <p className="eyebrow">Nossos princípios</p>
        <h2 id="principles-title">Gamificação a serviço do aprendizado</h2>
        <div className="principle-grid">
          {principles.map(({ icon: Icon, title, description }) => (
            <article className="principle-card" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <span>© 2026 EvangeliGO</span>
        <nav aria-label="Links legais">
          <Link to={ROUTE_PATHS.terms}>Termos</Link>
          <Link to={ROUTE_PATHS.privacy}>Privacidade</Link>
        </nav>
      </footer>
    </main>
  );
}
