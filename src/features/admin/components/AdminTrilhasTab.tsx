import { useEffect, useState } from "react";
import {
  excluirAulaCatalogo,
  excluirTrilhaCatalogo,
  listarAulasCatalogo,
  listarTrilhasCatalogo,
  salvarAulaCatalogo,
  salvarTrilhaCatalogo,
} from "../adminApi";
import {
  aulaFormSchema,
  trilhaFormSchema,
  type AulaCatalogo,
  type AulaForm,
  type TrilhaCatalogo,
  type TrilhaForm,
} from "../schemas";

const TRILHA_VAZIA: TrilhaForm = {
  id: "",
  slug: "",
  order: 1,
  title: "",
  description: "",
  verse_focus: "",
  ativo: true,
};

const AULA_VAZIA: AulaForm = {
  id: "",
  trilha_id: "",
  order: 1,
  title: "",
  summary: "",
  bible_references: "",
  estimated_minutes: 5,
  quiz_id: "",
  ativo: true,
};

/**
 * Aba "Trilhas & Aulas" do painel admin (T-015/ADR-056) — CRUD real de
 * trilhas/aulas ADICIONAIS às 5 trilhas/17 aulas estáticas (que continuam
 * em código, nunca editadas por aqui). `verse_focus`/`bible_references`
 * são editados como JSON bruto — ver o comentário em `schemas.ts` sobre
 * essa troca deliberada de polimento por viabilidade.
 */
export function AdminTrilhasTab() {
  const [trilhas, setTrilhas] = useState<TrilhaCatalogo[] | "carregando" | "erro">(
    "carregando",
  );
  const [aulas, setAulas] = useState<AulaCatalogo[] | "carregando" | "erro">("carregando");
  const [editandoTrilha, setEditandoTrilha] = useState<TrilhaForm | null>(null);
  const [editandoAula, setEditandoAula] = useState<AulaForm | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    setTrilhas("carregando");
    setAulas("carregando");
    listarTrilhasCatalogo().then(setTrilhas).catch(() => setTrilhas("erro"));
    listarAulasCatalogo().then(setAulas).catch(() => setAulas("erro"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvarTrilha() {
    if (!editandoTrilha) return;
    const resultado = trilhaFormSchema.safeParse(editandoTrilha);
    if (!resultado.success) {
      setErros(resultado.error.issues.map((issue) => issue.message));
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      await salvarTrilhaCatalogo(resultado.data);
      setEditandoTrilha(null);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível salvar."]);
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvarAula() {
    if (!editandoAula) return;
    const resultado = aulaFormSchema.safeParse(editandoAula);
    if (!resultado.success) {
      setErros(resultado.error.issues.map((issue) => issue.message));
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      await salvarAulaCatalogo(resultado.data);
      setEditandoAula(null);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível salvar."]);
    } finally {
      setSalvando(false);
    }
  }

  if (trilhas === "carregando" || aulas === "carregando") {
    return <p className="admin-vazio">Carregando trilhas e aulas…</p>;
  }
  if (trilhas === "erro" || aulas === "erro") {
    return <p className="admin-vazio">Não foi possível carregar trilhas/aulas.</p>;
  }

  return (
    <div>
      <p className="admin-vazio">
        As 5 trilhas/17 aulas originais continuam fixas em código — aqui você
        cria trilhas/aulas ADICIONAIS, que aparecem somadas a elas.
      </p>

      <h3>Trilhas</h3>
      <div className="admin-linha-acoes">
        <button type="button" className="secondary-button small" onClick={() => setEditandoTrilha(TRILHA_VAZIA)}>
          Nova trilha
        </button>
      </div>
      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Slug</th>
              <th>Ordem</th>
              <th>Ativa</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {trilhas.map((trilha) => (
              <tr key={trilha.id}>
                <td>{trilha.title}</td>
                <td>{trilha.slug}</td>
                <td>{trilha.order}</td>
                <td>{trilha.ativo ? "Sim" : "Não"}</td>
                <td>
                  <div className="admin-linha-acoes">
                    <button
                      type="button"
                      className="secondary-button small"
                      onClick={() =>
                        setEditandoTrilha({
                          id: trilha.id,
                          slug: trilha.slug,
                          order: trilha.order,
                          title: trilha.title,
                          description: trilha.description,
                          verse_focus: trilha.verse_focus ? JSON.stringify(trilha.verse_focus) : "",
                          ativo: trilha.ativo,
                        })
                      }
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button small"
                      onClick={() => excluirTrilhaCatalogo(trilha.id).then(carregar)}
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
      {trilhas.length === 0 && <p className="admin-vazio">Nenhuma trilha adicional cadastrada.</p>}

      {editandoTrilha && (
        <div className="admin-form" role="group" aria-label="Editar trilha">
          <label className="admin-form-campo">
            Id
            <input value={editandoTrilha.id} onChange={(e) => setEditandoTrilha({ ...editandoTrilha, id: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Slug
            <input value={editandoTrilha.slug} onChange={(e) => setEditandoTrilha({ ...editandoTrilha, slug: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Título
            <input value={editandoTrilha.title} onChange={(e) => setEditandoTrilha({ ...editandoTrilha, title: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Ordem
            <input
              type="number"
              min={1}
              value={editandoTrilha.order}
              onChange={(e) => setEditandoTrilha({ ...editandoTrilha, order: Number(e.target.value) })}
            />
          </label>
          <label className="admin-form-campo">
            <input
              type="checkbox"
              checked={editandoTrilha.ativo}
              onChange={(e) => setEditandoTrilha({ ...editandoTrilha, ativo: e.target.checked })}
            />{" "}
            Ativa
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Descrição
            <textarea
              value={editandoTrilha.description}
              onChange={(e) => setEditandoTrilha({ ...editandoTrilha, description: e.target.value })}
            />
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Referência-âncora (JSON de 1 BibleReference, opcional) — ex.:{" "}
            <code>{'{"book":"Romanos","chapter":1,"verseStart":16,"display":"Romanos 1:16"}'}</code>
            <textarea
              value={editandoTrilha.verse_focus}
              onChange={(e) => setEditandoTrilha({ ...editandoTrilha, verse_focus: e.target.value })}
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
                setEditandoTrilha(null);
                setErros([]);
              }}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="button" className="primary-button small" onClick={handleSalvarTrilha} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}

      <h3>Aulas</h3>
      <div className="admin-linha-acoes">
        <button type="button" className="secondary-button small" onClick={() => setEditandoAula(AULA_VAZIA)}>
          Nova aula
        </button>
      </div>
      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Trilha (id)</th>
              <th>Ordem</th>
              <th>Ativa</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((aula) => (
              <tr key={aula.id}>
                <td>{aula.title}</td>
                <td>{aula.trilha_id}</td>
                <td>{aula.order}</td>
                <td>{aula.ativo ? "Sim" : "Não"}</td>
                <td>
                  <div className="admin-linha-acoes">
                    <button
                      type="button"
                      className="secondary-button small"
                      onClick={() =>
                        setEditandoAula({
                          id: aula.id,
                          trilha_id: aula.trilha_id,
                          order: aula.order,
                          title: aula.title,
                          summary: aula.summary,
                          bible_references: JSON.stringify(aula.bible_references),
                          estimated_minutes: aula.estimated_minutes,
                          quiz_id: aula.quiz_id ?? "",
                          ativo: aula.ativo,
                        })
                      }
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button small"
                      onClick={() => excluirAulaCatalogo(aula.id).then(carregar)}
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
      {aulas.length === 0 && <p className="admin-vazio">Nenhuma aula adicional cadastrada.</p>}

      {editandoAula && (
        <div className="admin-form" role="group" aria-label="Editar aula">
          <label className="admin-form-campo">
            Id
            <input value={editandoAula.id} onChange={(e) => setEditandoAula({ ...editandoAula, id: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Id da trilha (estática ou do catálogo)
            <input
              value={editandoAula.trilha_id}
              onChange={(e) => setEditandoAula({ ...editandoAula, trilha_id: e.target.value })}
            />
          </label>
          <label className="admin-form-campo">
            Título
            <input value={editandoAula.title} onChange={(e) => setEditandoAula({ ...editandoAula, title: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Ordem
            <input
              type="number"
              min={1}
              value={editandoAula.order}
              onChange={(e) => setEditandoAula({ ...editandoAula, order: Number(e.target.value) })}
            />
          </label>
          <label className="admin-form-campo">
            Minutos estimados
            <input
              type="number"
              min={1}
              value={editandoAula.estimated_minutes}
              onChange={(e) => setEditandoAula({ ...editandoAula, estimated_minutes: Number(e.target.value) })}
            />
          </label>
          <label className="admin-form-campo">
            Id do quiz (opcional)
            <input value={editandoAula.quiz_id} onChange={(e) => setEditandoAula({ ...editandoAula, quiz_id: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            <input
              type="checkbox"
              checked={editandoAula.ativo}
              onChange={(e) => setEditandoAula({ ...editandoAula, ativo: e.target.checked })}
            />{" "}
            Ativa
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Resumo doutrinário
            <textarea value={editandoAula.summary} onChange={(e) => setEditandoAula({ ...editandoAula, summary: e.target.value })} />
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Referências bíblicas (JSON, array de 2 a 4 BibleReference)
            <textarea
              value={editandoAula.bible_references}
              onChange={(e) => setEditandoAula({ ...editandoAula, bible_references: e.target.value })}
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
                setEditandoAula(null);
                setErros([]);
              }}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="button" className="primary-button small" onClick={handleSalvarAula} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
