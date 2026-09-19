import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import "../community.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import {
  assinarMensagens,
  enviarMensagem,
  listarAmigos,
  listarMensagens,
  marcarMensagensComoLidas,
} from "../comunidadeApi";
import type { Amigo, Mensagem } from "../schemas";

/** Chat 1:1 com um amigo (T-014/ADR-057) — Supabase Realtime pra mensagens novas. */
export function ChatPage() {
  const { amigoId } = useParams<{ amigoId: string }>();
  const { user, authStatus } = useAuth();
  const [amigo, setAmigo] = useState<Amigo | null | "carregando">("carregando");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimDaListaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user || user.isDemo || !amigoId) return;
    let ativo = true;

    listarAmigos().then((lista) => {
      if (ativo) setAmigo(lista.find((a) => a.amigo_id === amigoId) ?? null);
    });

    listarMensagens(user.id, amigoId)
      .then((lista) => {
        if (ativo) setMensagens(lista);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as mensagens.");
      });

    marcarMensagensComoLidas(user.id, amigoId);

    const cancelar = assinarMensagens(user.id, amigoId, (mensagem) => {
      setMensagens((atual) =>
        atual.some((m) => m.id === mensagem.id) ? atual : [...atual, mensagem],
      );
    });

    return () => {
      ativo = false;
      cancelar();
    };
  }, [user, amigoId]);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length]);

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

  if (user.isDemo || !amigoId) {
    return <Navigate to={ROUTE_PATHS.comunidade} replace />;
  }

  async function handleEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!rascunho.trim() || !user || !amigoId) return;
    setEnviando(true);
    setErro(null);
    try {
      await enviarMensagem(user.id, amigoId, rascunho.trim());
      setRascunho("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.comunidade}>
          <FiArrowLeft aria-hidden="true" /> Amigos
        </Link>

        <section className="dash-card comunidade-chat" aria-labelledby="chat-title">
          <h1 id="chat-title">
            {amigo === "carregando" ? "Carregando…" : amigo ? `${amigo.nome} ${amigo.sobrenome}` : "Conversa"}
          </h1>

          <div className="comunidade-chat-mensagens">
            {mensagens.map((mensagem) => (
              <p
                key={mensagem.id}
                className={`comunidade-bolha${mensagem.remetente_id === user.id ? " comunidade-bolha--minha" : ""}`}
              >
                {mensagem.conteudo}
              </p>
            ))}
            {mensagens.length === 0 && (
              <p className="comunidade-vazio">Nenhuma mensagem ainda — diga oi!</p>
            )}
            <div ref={fimDaListaRef} />
          </div>

          {erro && <p className="config-erro">{erro}</p>}

          <form className="comunidade-chat-form" onSubmit={handleEnviar}>
            <input
              type="text"
              placeholder="Escreva uma mensagem…"
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              maxLength={2000}
              aria-label="Escreva uma mensagem"
            />
            <button type="submit" className="primary-button small" disabled={enviando || !rascunho.trim()}>
              <FiSend aria-hidden="true" /> Enviar
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
