import { useEffect, useState } from "react";
import {
  excluirConquistaCatalogo,
  listarConquistasCatalogo,
  salvarConquistaCatalogo,
} from "../adminApi";
import { conquistaFormSchema, type ConquistaCatalogo, type ConquistaForm } from "../schemas";

const RARIDADES = ["comum", "raro", "epico", "lendario"] as const;

const FORM_VAZIO: ConquistaForm = {
  id: "",
  titulo: "",
  descricao: "",
  raridade: "comum",
  reward_xp: 10,
  reward_gold: 5,
  ativo: true,
};

/**
 * Aba "Conquistas" do painel admin (T-015) — CRUD real contra
 * `conquistas_catalogo`. IMPORTANTE (ver ADR-054): editar aqui muda só os
 * METADADOS (título/descrição/recompensa/raridade/ativo); a condição que
 * de fato desbloqueia cada conquista continua em
 * `gamification/domain/achievements.ts`, casada pelo `id` — criar uma
 * conquista com um id novo aqui não a faz desbloquear sozinha sem também
 * escrever a condição em código. Editar uma já existente (mesmo id) é
 * seguro e útil (retunar recompensa/copy).
 */
export function AdminConquistasTab() {
  const [itens, setItens] = useState<ConquistaCatalogo[] | "carregando" | "erro">(
    "carregando",
  );
  const [editando, setEditando] = useState<ConquistaForm | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    setItens("carregando");
    listarConquistasCatalogo()
      .then(setItens)
      .catch(() => setItens("erro"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar() {
    if (!editando) return;
    const resultado = conquistaFormSchema.safeParse(editando);
    if (!resultado.success) {
      setErros(resultado.error.issues.map((issue) => issue.message));
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      await salvarConquistaCatalogo(resultado.data);
      setEditando(null);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível salvar."]);
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: string) {
    try {
      await excluirConquistaCatalogo(id);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível excluir."]);
    }
  }

  if (itens === "carregando") return <p className="admin-vazio">Carregando conquistas…</p>;
  if (itens === "erro") return <p className="admin-vazio">Não foi possível carregar as conquistas.</p>;

  return (
    <div>
      <div className="admin-linha-acoes">
        <button
          type="button"
          className="secondary-button small"
          onClick={() => setEditando(FORM_VAZIO)}
        >
          Nova conquista
        </button>
      </div>

      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Raridade</th>
              <th>XP/Ouro</th>
              <th>Ativa</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.titulo}</td>
                <td>{item.raridade}</td>
                <td>
                  {item.reward_xp} XP / {item.reward_gold} ouro
                </td>
                <td>{item.ativo ? "Sim" : "Não"}</td>
                <td>
                  <div className="admin-linha-acoes">
                    <button
                      type="button"
                      className="secondary-button small"
                      onClick={() => setEditando(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button small"
                      onClick={() => handleExcluir(item.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {itens.length === 0 && <p className="admin-vazio">Nenhuma conquista cadastrada.</p>}

      {editando && (
        <div className="admin-form" role="group" aria-label="Editar conquista">
          <label className="admin-form-campo">
            Id
            <input
              value={editando.id}
              onChange={(e) => setEditando({ ...editando, id: e.target.value })}
            />
          </label>
          <label className="admin-form-campo">
            Título
            <input
              value={editando.titulo}
              onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
            />
          </label>
          <label className="admin-form-campo">
            Raridade
            <select
              value={editando.raridade}
              onChange={(e) =>
                setEditando({ ...editando, raridade: e.target.value as ConquistaForm["raridade"] })
              }
            >
              {RARIDADES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form-campo">
            XP de recompensa
            <input
              type="number"
              min={0}
              value={editando.reward_xp}
              onChange={(e) =>
                setEditando({ ...editando, reward_xp: Number(e.target.value) })
              }
            />
          </label>
          <label className="admin-form-campo">
            Ouro de recompensa
            <input
              type="number"
              min={0}
              value={editando.reward_gold}
              onChange={(e) =>
                setEditando({ ...editando, reward_gold: Number(e.target.value) })
              }
            />
          </label>
          <label className="admin-form-campo">
            <input
              type="checkbox"
              checked={editando.ativo}
              onChange={(e) => setEditando({ ...editando, ativo: e.target.checked })}
            />{" "}
            Ativa
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Descrição
            <textarea
              value={editando.descricao}
              onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
            />
          </label>

          {erros.length > 0 && (
            <div className="admin-form-campo--largo">
              {erros.map((erro) => (
                <p key={erro} className="config-erro">
                  {erro}
                </p>
              ))}
            </div>
          )}

          <div className="admin-form-acoes">
            <button
              type="button"
              className="secondary-button small"
              onClick={() => {
                setEditando(null);
                setErros([]);
              }}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="primary-button small"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
