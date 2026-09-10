import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { PERGUNTAS_APOLOGETICA } from "../content";
import { ApologeticaPage } from "./ApologeticaPage";

beforeEach(() => {
  localStorage.clear();
});

function renderApologeticaPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ApologeticaPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("ApologeticaPage", () => {
  it("exibe o título e o link de voltar para o painel", () => {
    renderApologeticaPage();
    expect(screen.getByRole("heading", { name: "Apologética" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Painel/ })).toHaveAttribute(
      "href",
      "/jornada",
    );
  });

  it("exibe os chips de nível de dificuldade como filtro primário", () => {
    renderApologeticaPage();
    expect(screen.getByRole("button", { name: "Iniciante" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Intermediário" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avançado" })).toBeInTheDocument();
  });

  it("lista todas as perguntas sem filtro nenhum", () => {
    renderApologeticaPage();
    expect(
      screen.getByText("Como sabemos que Deus existe?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${PERGUNTAS_APOLOGETICA.length} perguntas`),
    ).toBeInTheDocument();
  });

  it("filtra por nível de dificuldade ao clicar no chip", () => {
    renderApologeticaPage();
    fireEvent.click(screen.getByRole("button", { name: "Avançado" }));
    // Pergunta "avancado": "Como sabemos que os livros da Bíblia são os corretos?"
    expect(
      screen.getByText("Como sabemos que os livros da Bíblia são os corretos?"),
    ).toBeInTheDocument();
    // Pergunta "iniciante" não deve aparecer mais.
    expect(
      screen.queryByText("Como sabemos que Deus existe?"),
    ).not.toBeInTheDocument();
  });

  it("filtra por busca de texto", () => {
    renderApologeticaPage();
    fireEvent.change(
      screen.getByPlaceholderText("Buscar perguntas ou respostas..."),
      { target: { value: "ressuscitou" } },
    );
    expect(
      screen.getByText("Jesus realmente ressuscitou?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Como sabemos que Deus existe?"),
    ).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando a busca não encontra nada", () => {
    renderApologeticaPage();
    fireEvent.change(
      screen.getByPlaceholderText("Buscar perguntas ou respostas..."),
      { target: { value: "xxxxxnaoexistexxxxx" } },
    );
    expect(screen.getByText("Nenhuma pergunta encontrada.")).toBeInTheDocument();
  });

  it("expande a pergunta ao clicar (accordion no lugar) e mostra resposta e referências", () => {
    renderApologeticaPage();
    const cabecalho = screen.getByRole("button", {
      name: /Como sabemos que Deus existe\?/,
    });
    expect(cabecalho).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(cabecalho);
    expect(cabecalho).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Salmos 19:1")).toBeInTheDocument();
    expect(screen.getByText("Romanos 1:20")).toBeInTheDocument();

    fireEvent.click(cabecalho);
    expect(cabecalho).toHaveAttribute("aria-expanded", "false");
  });

  it("marca a pergunta como estudada ao expandir", () => {
    renderApologeticaPage();
    const cabecalho = screen.getByRole("button", {
      name: /Como sabemos que Deus existe\?/,
    });
    fireEvent.click(cabecalho);
    expect(screen.getByLabelText("Já estudada")).toBeInTheDocument();
  });
});
