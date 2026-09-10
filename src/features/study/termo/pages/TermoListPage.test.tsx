import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../../authentication/context/AuthContext";
import { TERMO_CHALLENGES } from "../content";
import { TermoListPage } from "./TermoListPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TermoListPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("TermoListPage", () => {
  it("lista todos os desafios pela referência bíblica", () => {
    renderPage();
    for (const challenge of TERMO_CHALLENGES) {
      expect(screen.getByText(challenge.referencia)).toBeInTheDocument();
    }
  });

  it("cada card aponta para a rota de jogo correspondente, sem revelar a resposta", () => {
    renderPage();
    const primeiro = TERMO_CHALLENGES[0];
    const link = screen.getByText(primeiro.referencia).closest("a");
    expect(link).toHaveAttribute("href", `/exercicios/termo/${primeiro.id}`);
    expect(screen.queryByText(primeiro.resposta)).not.toBeInTheDocument();
  });
});
