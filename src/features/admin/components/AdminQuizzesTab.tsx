import { useEffect, useState } from "react";
import { excluirQuizCatalogo, listarQuizzesCatalogo, salvarQuizCatalogo } from "../adminApi";
import { quizFormSchema, type QuizCatalogo, type QuizForm } from "../schemas";

const QUIZ_VAZIO: QuizForm = {
  id: "",
  aula_id: "",
  title: "",
  questions: "",
  ativo: true,
};

const EXEMPLO_PERGUNTA = JSON.stringify(
  [
    {
      type: "verdadeiro_falso",
      id: "exemplo-1",
      prompt: "Pergunta de exemplo — troque por perguntas reais.",
      explanation: "Explicação exibida no feedback.",
      bibleReference: { book: "Romanos", chapter: 1, verseStart: 16, display: "Romanos 1:16" },
      correctAnswer: true,
    },
  ],
  null,
  2,
);

/**
 * Aba "Quizzes" do painel admin (T-015/ADR-056) — CRUD real de quizzes
 * ADICIONAIS (de aula ou avulsos). Reaproveita o mesmo motor genérico de
 * `study/quiz/engine.ts` — um quiz criado aqui com `aula_id` de uma aula
 * existente (estática ou do catálogo) fica jogável assim que
 * `QuizPage`/`BibliaQuizPage` também consultarem este catálogo (ver
 * `study/content/index.ts`/`study/quiz/content.ts`, integração de leitura).
 */
export function AdminQuizzesTab() {
  const [itens, setItens] = useState<QuizCatalogo[] | "carregando" | "erro">("carregando");
  const [editando, setEditando] = useState<QuizForm | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    setItens("carregando");
    listarQuizzesCatalogo().then(setItens).catch(() => setItens("erro"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar() {
    if (!editando) return;
    const resultado = quizFormSchema.safeParse(editando);
    if (!resultado.success) {
      setErros(resultado.error.issues.map((issue) => issue.message));
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      await salvarQuizCatalogo(resultado.data);
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
      await excluirQuizCatalogo(id);
      carregar();
    } catch (erro) {
      setErros([erro instanceof Error ? erro.message : "Não foi possível excluir."]);
    }
  }

  if (itens === "carregando") return <p className="admin-vazio">Carregando quizzes…</p>;
  if (itens === "erro") return <p className="admin-vazio">Não foi possível carregar os quizzes.</p>;

  return (
    <div>
      <div className="admin-linha-acoes">
        <button
          type="button"
          className="secondary-button small"
          onClick={() => setEditando({ ...QUIZ_VAZIO, questions: EXEMPLO_PERGUNTA })}
        >
          Novo quiz
        </button>
      </div>

      <div className="admin-tabela-wrap">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Aula (id)</th>
              <th>Perguntas</th>
              <th>Ativo</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.aula_id ?? "— (avulso)"}</td>
                <td>{item.questions.length}</td>
                <td>{item.ativo ? "Sim" : "Não"}</td>
                <td>
                  <div className="admin-linha-acoes">
                    <button
                      type="button"
                      className="secondary-button small"
                      onClick={() =>
                        setEditando({
                          id: item.id,
                          aula_id: item.aula_id ?? "",
                          title: item.title,
                          questions: JSON.stringify(item.questions, null, 2),
                          ativo: item.ativo,
                        })
                      }
                    >
                      Editar
                    </button>
                    <button type="button" className="danger-button small" onClick={() => handleExcluir(item.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {itens.length === 0 && <p className="admin-vazio">Nenhum quiz adicional cadastrado.</p>}

      {editando && (
        <div className="admin-form" role="group" aria-label="Editar quiz">
          <label className="admin-form-campo">
            Id
            <input value={editando.id} onChange={(e) => setEditando({ ...editando, id: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Título
            <input value={editando.title} onChange={(e) => setEditando({ ...editando, title: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            Id da aula (vazio = quiz avulso, ex.: bíblico por capítulo)
            <input value={editando.aula_id} onChange={(e) => setEditando({ ...editando, aula_id: e.target.value })} />
          </label>
          <label className="admin-form-campo">
            <input
              type="checkbox"
              checked={editando.ativo}
              onChange={(e) => setEditando({ ...editando, ativo: e.target.checked })}
            />{" "}
            Ativo
          </label>
          <label className="admin-form-campo admin-form-campo--largo">
            Perguntas (JSON, array de 3+ — tipos: escolha_unica, verdadeiro_falso, multipla_selecao)
            <textarea
              rows={12}
              value={editando.questions}
              onChange={(e) => setEditando({ ...editando, questions: e.target.value })}
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
            <button type="button" className="primary-button small" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
