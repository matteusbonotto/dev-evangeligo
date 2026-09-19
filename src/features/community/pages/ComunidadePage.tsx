import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiMessageCircle, FiSearch, FiUserPlus, FiUsers } from "react-icons/fi";
import "../community.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { buildChatPath } from "../routePaths";
import {
  buscarUsuariosParaAmizade,
  enviarSolicitacaoAmizade,
  listarAmigos,
  listarSolicitacoesPendentes,
  responderSolicitacaoAmizade,
} from "../comunidadeApi";
import type { Amigo, SolicitacaoAmizade, UsuarioBusca } from "../schemas";

function IniciaisAvatar({ nome }: { nome: string }) {
  return (
    <span className="comunidade-avatar" aria-hidden="true">
      {nome.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/**
 * Comunidade (T-014/ADR-057) — amigos: buscar, solicitar, aceitar/recusar,
 * listar. MVP real: fica de fora desta rodada o feed/grupos/ranking do
 * pedido original de 48 seções de uma sessão anterior (plano perdido, ver
 * ADR-057) — aqui é amizades + chat 1:1 (`ChatPage.tsx`) + convite de
 * missão colaborativa, o núcleo social realmente pedido no checklist
 * original ("Mensagens, amizades, convites").
 */
export function ComunidadePage() {
  const { user, authStatus } = useAuth();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<UsuarioBusca[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [amigos, setAmigos] = useState<Amigo[] | "carregando" | "erro">("carregando");
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAmizade[] | "carregando" | "erro">(
    "carregando",
  );
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoPara, setEnviandoPara] = useState<string | null>(null);

  function carregar() {
    setAmigos("carregando");
    setSolicitacoes("carregando");
    listarAmigos().then(setAmigos).catch(() => setAmigos("erro"));
    listarSolicitacoesPendentes().then(setSolicitacoes).catch(() => setSolicitacoes("erro"));
  }

  useEffect(() => {
    if (user && !user.isDemo) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isDemo]);

  if (!user) {
    if (authStatus === "authenticated") {
      return (
        <AppShell>
          <main className="loading-screen">Carregando...</main>
        </AppShell>
      );
    }
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  async function handleBuscar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!busca.trim()) return;
    setBuscando(true);
    setErro(null);
    try {
      setResultados(await buscarUsuariosParaAmizade(busca.trim()));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível buscar.");
    } finally {
      setBuscando(false);
    }
  }

  async function handleSolicitar(destinatarioId: string) {
    setEnviandoPara(destinatarioId);
    setErro(null);
    try {
      await enviarSolicitacaoAmizade(destinatarioId);
      setResultados((atual) => atual?.filter((u) => u.id !== destinatarioId) ?? null);
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar a solicitação.");
    } finally {
      setEnviandoPara(null);
    }
  }

  async function handleResponder(solicitacaoId: string, aceitar: boolean) {
    setErro(null);
    try {
      await responderSolicitacaoAmizade(solicitacaoId, aceitar);
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível responder.");
    }
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Painel
        </Link>

        <section className="dash-card" aria-labelledby="comunidade-title">
          <p className="eyebrow">
            <FiUsers aria-hidden="true" /> Comunidade
          </p>
          <h1 id="comunidade-title">Amigos</h1>

          {user.isDemo ? (
            <p className="comunidade-vazio">
              Comunidade só está disponível para contas reais — crie uma conta
              para adicionar amigos e conversar.
            </p>
          ) : (
            <>
              <form className="comunidade-busca" onSubmit={handleBuscar}>
                <FiSearch className="comunidade-busca-icone" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar por nome…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Buscar usuários por nome"
                />
                <button type="submit" className="secondary-button small" disabled={buscando}>
                  {buscando ? "Buscando…" : "Buscar"}
                </button>
              </form>

              {erro && <p className="config-erro">{erro}</p>}

              {resultados && (
                <ul className="comunidade-lista">
                  {resultados.map((pessoa) => (
                    <li key={pessoa.id} className="comunidade-item">
                      <IniciaisAvatar nome={pessoa.nome} />
                      <span className="comunidade-item-nome">
                        {pessoa.nome} {pessoa.sobrenome}
                      </span>
                      <button
                        type="button"
                        className="secondary-button small"
                        onClick={() => handleSolicitar(pessoa.id)}
                        disabled={enviandoPara === pessoa.id}
                      >
                        <FiUserPlus aria-hidden="true" /> Adicionar
                      </button>
                    </li>
                  ))}
                  {resultados.length === 0 && (
                    <p className="comunidade-vazio">Nenhum usuário encontrado.</p>
                  )}
                </ul>
              )}

              {solicitacoes !== "carregando" && solicitacoes !== "erro" && solicitacoes.length > 0 && (
                <>
                  <h3>Solicitações</h3>
                  <ul className="comunidade-lista">
                    {solicitacoes.map((s) => (
                      <li key={s.id} className="comunidade-item">
                        <IniciaisAvatar nome={s.nome} />
                        <span className="comunidade-item-nome">
                          {s.nome} {s.sobrenome}
                          {s.direcao === "enviada" && (
                            <span className="comunidade-item-tag"> · enviada</span>
                          )}
                        </span>
                        {s.direcao === "recebida" ? (
                          <div className="admin-linha-acoes">
                            <button
                              type="button"
                              className="secondary-button small"
                              onClick={() => handleResponder(s.id, true)}
                            >
                              Aceitar
                            </button>
                            <button
                              type="button"
                              className="danger-button small"
                              onClick={() => handleResponder(s.id, false)}
                            >
                              Recusar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="secondary-button small"
                            onClick={() => handleResponder(s.id, false)}
                          >
                            Cancelar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h3>Meus amigos</h3>
              {amigos === "carregando" && <p className="comunidade-vazio">Carregando…</p>}
              {amigos === "erro" && <p className="comunidade-vazio">Não foi possível carregar.</p>}
              {Array.isArray(amigos) && (
                <ul className="comunidade-lista">
                  {amigos.map((amigo) => (
                    <li key={amigo.amigo_id} className="comunidade-item">
                      <IniciaisAvatar nome={amigo.nome} />
                      <span className="comunidade-item-nome">
                        {amigo.nome} {amigo.sobrenome}
                      </span>
                      <Link className="secondary-button small" to={buildChatPath(amigo.amigo_id)}>
                        <FiMessageCircle aria-hidden="true" /> Conversar
                      </Link>
                    </li>
                  ))}
                  {amigos.length === 0 && (
                    <p className="comunidade-vazio">
                      Você ainda não tem amigos — busque alguém pelo nome acima.
                    </p>
                  )}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
