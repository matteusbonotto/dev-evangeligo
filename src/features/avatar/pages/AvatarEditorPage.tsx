import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import "../avatar.css";
import { AvatarCustomizador } from "../components/AvatarCustomizador";
import { AppShell } from "../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../../authentication/context/AuthContext";
import type { AvatarConfig } from "../types";

/**
 * Criação/edição de personagem (T-033) — pedido explícito do usuário,
 * comparando com o app legado. Usa a mesma biblioteca do legado
 * ("Avataaars", `avatarUrl.ts`) e as mesmas categorias
 * (`data/opcoesAvatar.ts`). Salva a cada escolha via `updateUser`
 * (T-053/ADR-046) — o MESMO canal que já persiste RPG/inventário/
 * armadura, então demo vira `localStorage` e conta real vira
 * `profiles.avatar_config`/`avatar_url` automaticamente, sem lógica
 * própria de persistência aqui.
 */
export function AvatarEditorPage() {
  const { user, authStatus, updateUser } = useAuth();

  if (!user) {
    // Conta real ainda carregando o estado (T-047/T-053) — não redirecionar
    // antes da busca terminar (senão um F5/navegação direta pra cá manda a
    // pessoa de volta pra home antes do `user` existir).
    if (authStatus === "authenticated") {
      return (
        <AppShell>
          <main className="loading-screen">Carregando...</main>
        </AppShell>
      );
    }
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  const config = user.avatarConfig;

  function handleEscolher(
    campo: keyof Omit<AvatarConfig, "fundo">,
    valor: string,
  ) {
    updateUser((atual) => ({
      ...atual,
      avatarConfig: { ...atual.avatarConfig, [campo]: valor },
    }));
  }

  function handleEscolherFundo(valor: string) {
    updateUser((atual) => ({
      ...atual,
      avatarConfig: { ...atual.avatarConfig, fundo: valor },
    }));
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section
          className="dash-card avatar-editor"
          aria-labelledby="avatar-title"
        >
          <p className="eyebrow">
            <FiUser aria-hidden="true" /> Personagem
          </p>
          <h1 id="avatar-title">Personalize seu avatar</h1>

          <AvatarCustomizador
            config={config}
            onEscolher={handleEscolher}
            onEscolherFundo={handleEscolherFundo}
          />

          <Link className="primary-button full" to={ROUTE_PATHS.dashboard}>
            Salvar personagem
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
