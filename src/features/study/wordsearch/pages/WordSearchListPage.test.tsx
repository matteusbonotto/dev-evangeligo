import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../../authentication/context/AuthContext";
import { WORDSEARCH_PUZZLES } from "../content";
import { WordSearchListPage } from "./WordSearchListPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <WordSearchListPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("WordSearchListPage", () => {
  it("lista todos os desafios de caça-palavras", () => {
    renderPage();
    for (const puzzle of WORDSEARCH_PUZZLES) {
      expect(screen.getByText(puzzle.titulo)).toBeInTheDocument();
    }
  });

  it("cada card aponta para a rota de jogo correspondente", () => {
    renderPage();
    const link = screen.getByText(WORDSEARCH_PUZZLES[0].titulo).closest("a");
    expect(link).toHaveAttribute(
      "href",
      `/exercicios/caca-palavras/${WORDSEARCH_PUZZLES[0].id}`,
    );
  });
});
