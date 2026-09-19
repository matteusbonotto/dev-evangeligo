import { useEffect, useState } from "react";
import {
  excluirMissaoCatalogo,
  listarMissoesCatalogo,
  salvarMissaoCatalogo,
} from "../adminApi";
import { missaoFormSchema, type MissaoCatalogo, type MissaoForm } from "../schemas";

const TIPOS = ["humana", "espiritual", "conhecimento", "tarefa", "casal", "colaborativa"] as const;
const CADENCIAS = ["diaria", "semanal"] as const;

const FORM_VAZIO: MissaoForm = {
  id: "",
  tipo: "tarefa",
  titulo: "",
  descricao: "",
  cadencia: "diaria",
  meta: 1,
  reward_xp: 10,
  reward_gold: 5,
  ativo: true,
};

/**
 * Aba "Missões" do painel admin (T-015) — CRUD real contra
 * `missoes_catalogo`. Diferente de Conquistas, missões são 100%
 * orientadas a dado (sem condição própria em código por id) — ver
 * ADR-054 — então uma missão nova cadastrada aqui já é imediatamente
 * utilizável assim que o sistema de missões for ligado a contas reais
 * (pendência registrada em ADR-052, ainda não feita).
 */
export function AdminMissoesTab() {
  const [itens, setItens] = useState<MissaoCatalogo[] | "carregando" | "erro">("carregando");
  const [editando, setEditando] = useState<MissaoForm | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    setItens("carregando");
    listarMissoesCatalogo()
      .then(setItens)
      .catch(() => setItens("erro"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar() {
    if (!editando) return;
    const resultado = missaoFormSchema.safeParse(editando);
    if (!resultado.success) {
      setErros(resultado.error.issues.map((issue) => issue.message));
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      await salvarMissaoCatalogo(resultado.data);
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
      await excluirMissaoCatalogo(id);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível excluir."]);
    }
  }

  if (itens === "carregando") return <p className="admin-vazio">Carregando missões…</p>;
  if (itens === "erro") return <p className="admin-vazio">Não foi possível carregar as missões.</p>;

  return (
    <div>
      <div className="admin-linha-acoes">
        <button
          type="button"
          className="secondary-button small"
          onClick={() => setEditando(FORM_VAZIO)}
        >
          Nova missão
        </button>
      </div>

      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Cadência</th>
              <th>Meta</th>
              <th>XP/Ouro</th>
              <th>Ativa</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.titulo}</td>
                <td>{item.tipo}</td>
                <td>{item.cadencia}</td>
                <td>{item.meta}</td>
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
      {itens.length === 0 && <p className="admin-vazio">Nenhuma missão cadastrada.</p>}

      {editando && (
        <div className="admin-form" role="group" aria-label="Editar missão">
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
            Tipo
            <select
              value={editando.tipo}
              onChange={(e) => setEditando({ ...editando, tipo: e.target.value as MissaoForm["tipo"] })}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form-campo">
            Cadência
            <select
              value={editando.cadencia}
              onChange={(e) =>
                setEditando({ ...editando, cadencia: e.target.value as MissaoForm["cadencia"] })
              }
            >
              {CADENCIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form-campo">
            Meta (quantidade)
            <input
              type="number"
              min={1}
              value={editando.meta}
              onChange={(e) => setEditando({ ...editando, meta: Number(e.target.value) })}
            />
          </label>
          <label className="admin-form-campo">
            XP de recompensa
            <input
              type="number"
              min={0}
              value={editando.reward_xp}
              onChange={(e) => setEditando({ ...editando, reward_xp: Number(e.target.value) })}
            />
          </label>
          <label className="admin-form-campo">
            Ouro de recompensa
            <input
              type="number"
              min={0}
              value={editando.reward_gold}
              onChange={(e) => setEditando({ ...editando, reward_gold: Number(e.target.value) })}
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
