import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { LivrosPage } from "./LivrosPage";

beforeEach(() => {
  localStorage.clear();
});

function renderLivrosPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LivrosPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LivrosPage", () => {
  it("exibe os 66 livros com filtros por testamento", () => {
    renderLivrosPage();
    expect(
      screen.getByRole("button", { name: "Antigo Testamento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Novo Testamento" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gênesis")).toBeInTheDocument();
    expect(screen.getByText("Apocalipse")).toBeInTheDocument();
  });

  it("cada link de livro aponta para a rota de capítulos correspondente", () => {
    renderLivrosPage();
    const linkGenesis = screen.getByText("Gênesis").closest("a");
    expect(linkGenesis).toHaveAttribute("href", "/biblia/gen");
  });

  it("exibe o resumo geral de progresso (0/66 livros sem leitura)", () => {
    renderLivrosPage();
    expect(screen.getByText("0/66 livros")).toBeInTheDocument();
  });

  it("mostra o cartão da Harpa Cristã depois de Apocalipse, apontando para /harpa", () => {
    renderLivrosPage();
    expect(
      screen.getByRole("link", { name: /Harpa Cristã/ }),
    ).toHaveAttribute("href", "/harpa");
  });

  it("o filtro 'Harpa Cristã' isola só o cartão da Harpa (nenhum livro)", () => {
    renderLivrosPage();
    fireEvent.click(screen.getByRole("button", { name: "Harpa Cristã" }));
    expect(screen.getByRole("link", { name: /Harpa Cristã/ })).toBeInTheDocument();
    expect(screen.queryByText("Gênesis")).not.toBeInTheDocument();
    expect(screen.queryByText("Apocalipse")).not.toBeInTheDocument();
  });
});
