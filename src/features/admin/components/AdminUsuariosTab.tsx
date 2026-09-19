import { useEffect, useState } from "react";
import { definirRoleUsuario, listarUsuarios } from "../adminApi";
import type { UsuarioAdmin } from "../schemas";

/**
 * Aba "Usuários" do painel admin (T-015) — listar todas as contas e
 * promover/rebaixar `role`. Usa as RPCs `listar_usuarios_admin`/
 * `definir_role_usuario` (nunca `service_role` no frontend, regra 11) — a
 * própria RPC recusa alterar o role de quem está chamando (`meuId`),
 * então o botão também fica desabilitado nessa linha, por clareza.
 */
export function AdminUsuariosTab({ meuId }: { meuId: string }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | "carregando" | "erro">(
    "carregando",
  );
  const [alterandoId, setAlterandoId] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  function carregar() {
    setUsuarios("carregando");
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setUsuarios("erro"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternarRole(usuario: UsuarioAdmin) {
    setErroAcao(null);
    setAlterandoId(usuario.id);
    try {
      const novoRole = usuario.role === "admin" ? "user" : "admin";
      await definirRoleUsuario(usuario.id, novoRole);
      carregar();
    } catch (erro) {
      setErroAcao(erro instanceof Error ? erro.message : "Não foi possível alterar o papel.");
    } finally {
      setAlterandoId(null);
    }
  }

  if (usuarios === "carregando") {
    return <p className="admin-vazio">Carregando usuários…</p>;
  }
  if (usuarios === "erro") {
    return <p className="admin-vazio">Não foi possível carregar os usuários.</p>;
  }

  return (
    <div>
      {erroAcao && <p className="config-erro">{erroAcao}</p>}
      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  {usuario.nome} {usuario.sobrenome}
                </td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`admin-role-badge admin-role-badge--${usuario.role}`}>
                    {usuario.role === "admin" ? "Admin" : "Usuário"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="secondary-button small"
                    disabled={usuario.id === meuId || alterandoId === usuario.id}
                    onClick={() => alternarRole(usuario)}
                  >
                    {usuario.role === "admin" ? "Tornar usuário" : "Tornar admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {usuarios.length === 0 && <p className="admin-vazio">Nenhum usuário encontrado.</p>}
    </div>
  );
}
