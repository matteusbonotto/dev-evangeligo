import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { DEVOCIONAIS } from "../content";
import { FeedDevocionaisPage } from "./FeedDevocionaisPage";

beforeEach(() => {
  localStorage.clear();
});

function renderFeedDevocionaisPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <FeedDevocionaisPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("FeedDevocionaisPage", () => {
  it("exibe o título e o link de voltar para o painel", () => {
    renderFeedDevocionaisPage();
    expect(screen.getByRole("heading", { name: "Devocionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Painel/ })).toHaveAttribute(
      "href",
      "/jornada",
    );
  });

  it("lista todos os devocionais com título e referência", () => {
    renderFeedDevocionaisPage();
    for (const devocional of DEVOCIONAIS) {
      expect(screen.getByText(devocional.titulo)).toBeInTheDocument();
    }
    expect(screen.getByText("Efésios 2:8")).toBeInTheDocument();
  });

  it("expande um devocional ao clicar (accordion no lugar) e mostra reflexão e aplicação", () => {
    renderFeedDevocionaisPage();
    const primeiro = DEVOCIONAIS[0];
    const cabecalho = screen.getByRole("button", { name: new RegExp(primeiro.titulo) });
    expect(cabecalho).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(cabecalho);
    expect(cabecalho).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(primeiro.reflexao[0])).toBeInTheDocument();
    expect(screen.getByText(primeiro.aplicacao)).toBeInTheDocument();

    fireEvent.click(cabecalho);
    expect(cabecalho).toHaveAttribute("aria-expanded", "false");
  });

  it("marca o devocional como lido ao expandir", () => {
    renderFeedDevocionaisPage();
    const primeiro = DEVOCIONAIS[0];
    const cabecalho = screen.getByRole("button", { name: new RegExp(primeiro.titulo) });
    fireEvent.click(cabecalho);
    expect(screen.getByLabelText("Já lido")).toBeInTheDocument();
  });
});
