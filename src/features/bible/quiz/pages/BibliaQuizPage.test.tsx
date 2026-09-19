import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../../authentication/context/AuthContext";
import { quizCapituloAprovado, quizLivroAprovado } from "../progresso";
import { BibliaQuizPage } from "./BibliaQuizPage";

function renderBibliaQuizPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/biblia/:livroCodigo/:capitulo/quiz" element={<BibliaQuizPage />} />
          <Route path="/biblia/:livroCodigo/quiz" element={<BibliaQuizPage />} />
          <Route path="/biblia" element={<p>Lista de livros</p>} />
          <Route path="/biblia/:livroCodigo/:capitulo" element={<p>Página de leitura</p>} />
          <Route path="/biblia/:livroCodigo" element={<p>Página de capítulos</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("BibliaQuizPage — quiz por capítulo", () => {
  it("exibe a primeira pergunta do quiz de Rute 1", () => {
    renderBibliaQuizPage("/biblia/rut/1/quiz");
    expect(screen.getByText("Pergunta 1 de 5")).toBeInTheDocument();
    expect(
      screen.getByText(/Por que Elimeleque levou sua família de Belém/),
    ).toBeInTheDocument();
  });

  it("redireciona pra /biblia quando o livro/capítulo não tem quiz ainda", () => {
    renderBibliaQuizPage("/biblia/gen/1/quiz");
    expect(screen.getByText("Lista de livros")).toBeInTheDocument();
  });

  it("completa as 5 perguntas de Rute 1 corretamente, marca o selo e mostra o resultado perfeito", () => {
    renderBibliaQuizPage("/biblia/rut/1/quiz");

    const respostasCorretas = [
      "Havia fome na terra de Judá",
      "Noemi, e os filhos Malom e Quiliom",
      "Verdadeiro",
      "Os três morreram, deixando Noemi sem marido e sem filhos",
      "Que iria com Noemi, pois o povo e o Deus de Noemi seriam também dela",
    ];

    for (let i = 0; i < respostasCorretas.length; i++) {
      const nomeOpcao = respostasCorretas[i];
      const role = nomeOpcao === "Verdadeiro" ? "radio" : "radio";
      fireEvent.click(screen.getByRole(role, { name: nomeOpcao }));
      fireEvent.click(screen.getByRole("button", { name: "Responder" }));
      const botaoContinuar = screen.getByRole("button", {
        name: i === respostasCorretas.length - 1 ? "Ver resultado" : "Próxima pergunta",
      });
      fireEvent.click(botaoContinuar);
    }

    expect(screen.getByText("Quiz concluído!")).toBeInTheDocument();
    expect(screen.getByText("5 de 5 corretas — perfeito!")).toBeInTheDocument();
    expect(screen.getByText(/Selo de compreensão conquistado/)).toBeInTheDocument();
    expect(quizCapituloAprovado("RUT", 1)).toBe(true);
  });
});

describe("BibliaQuizPage — quiz do livro inteiro", () => {
  it("exibe a primeira pergunta do quiz do livro de Rute (perguntas próprias, diferentes das de capítulo)", () => {
    renderBibliaQuizPage("/biblia/rut/quiz");
    expect(
      screen.getByText(/Em que período da história de Israel a narrativa de Rute se passa/),
    ).toBeInTheDocument();
  });

  it("redireciona pra /biblia quando o livro não tem quiz de livro ainda", () => {
    renderBibliaQuizPage("/biblia/gen/quiz");
    expect(screen.getByText("Lista de livros")).toBeInTheDocument();
  });
});

describe("marcarQuizLivroAprovado (via progresso)", () => {
  it("começa como não aprovado", () => {
    expect(quizLivroAprovado("RUT")).toBe(false);
  });
});
