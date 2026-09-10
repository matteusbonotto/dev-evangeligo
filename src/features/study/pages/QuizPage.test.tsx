import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { QuizPage } from "./QuizPage";

function renderQuizPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/trilhas/:trilhaSlug/aulas/:aulaId/quiz"
            element={<QuizPage />}
          />
          <Route path="/trilhas" element={<p>Lista de trilhas</p>} />
          <Route
            path="/trilhas/:trilhaSlug/aulas/:aulaId"
            element={<p>Página da aula</p>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("QuizPage", () => {
  it("exibe a primeira pergunta do quiz de Sola Scriptura", () => {
    renderQuizPage("/trilhas/solas/aulas/solas-1/quiz");

    expect(screen.getByText("Pergunta 1 de 3")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Segundo a Sola Scriptura, qual é a posição da Escritura em relação a tradições eclesiásticas e concílios?",
      ),
    ).toBeInTheDocument();
  });

  it("responder corretamente mostra feedback de acerto com explicação e referência", () => {
    renderQuizPage("/trilhas/solas/aulas/solas-1/quiz");

    fireEvent.click(
      screen.getByRole("radio", {
        name: "É a única regra infalível de fé e prática, acima delas",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));

    expect(screen.getByText("Correto!")).toBeInTheDocument();
    expect(screen.getByText("2 Timóteo 3:16-17")).toBeInTheDocument();
  });

  it("botão Responder fica desabilitado até selecionar uma alternativa", () => {
    renderQuizPage("/trilhas/solas/aulas/solas-1/quiz");

    expect(screen.getByRole("button", { name: "Responder" })).toBeDisabled();
  });

  it("completa as 3 perguntas com respostas corretas e mostra o resultado perfeito", () => {
    renderQuizPage("/trilhas/solas/aulas/solas-1/quiz");

    // Q1 — escolha única
    fireEvent.click(
      screen.getByRole("radio", {
        name: "É a única regra infalível de fé e prática, acima delas",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));
    fireEvent.click(screen.getByRole("button", { name: "Próxima pergunta" }));

    // Q2 — verdadeiro/falso
    expect(screen.getByText("Pergunta 2 de 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Falso" }));
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));
    fireEvent.click(screen.getByRole("button", { name: "Próxima pergunta" }));

    // Q3 — múltipla seleção
    expect(screen.getByText("Pergunta 3 de 3")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Examinavam as Escrituras diariamente para confirmar o que ouviam",
      }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Usavam a Escritura como padrão para testar até o ensino apostólico",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver resultado" }));

    expect(screen.getByText("Quiz concluído!")).toBeInTheDocument();
    expect(screen.getByText("3 de 3 corretas — perfeito!")).toBeInTheDocument();
    expect(screen.getByText("+50 XP · +30 ouro")).toBeInTheDocument();
  });

  it("redireciona para /trilhas quando a aula não tem quiz associado", () => {
    renderQuizPage("/trilhas/solas/aulas/solas-2/quiz");

    expect(screen.getByText("Lista de trilhas")).toBeInTheDocument();
  });
});
