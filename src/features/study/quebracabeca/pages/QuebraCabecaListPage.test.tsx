import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../../authentication/context/AuthContext";
import { getLivroByOrder } from "../../../bible/data/livros";
import { QUEBRA_CABECA_CHALLENGES } from "../content";
import { QuebraCabecaListPage } from "./QuebraCabecaListPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <QuebraCabecaListPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("QuebraCabecaListPage", () => {
  it("lista todos os desafios pela referência bíblica, sem revelar o texto", () => {
    renderPage();
    for (const challenge of QUEBRA_CABECA_CHALLENGES) {
      const livro = getLivroByOrder(challenge.livroOrder)!;
      expect(
        screen.getByText(`${livro.nome} ${challenge.capitulo}:${challenge.versiculo}`),
      ).toBeInTheDocument();
    }
  });

  it("cada card aponta para a rota de jogo correspondente", () => {
    renderPage();
    const primeiro = QUEBRA_CABECA_CHALLENGES[0];
    const livro = getLivroByOrder(primeiro.livroOrder)!;
    const link = screen
      .getByText(`${livro.nome} ${primeiro.capitulo}:${primeiro.versiculo}`)
      .closest("a");
    expect(link).toHaveAttribute(
      "href",
      `/exercicios/quebra-cabeca/${primeiro.id}`,
    );
  });
});
