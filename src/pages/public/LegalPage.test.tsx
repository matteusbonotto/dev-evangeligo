import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LegalPage } from "./LegalPage";

function renderLegalPage(kind: "terms" | "privacy") {
  return render(
    <MemoryRouter>
      <LegalPage kind={kind} />
    </MemoryRouter>,
  );
}

describe("LegalPage", () => {
  it("exibe o título e as seções dos Termos de Uso", () => {
    renderLegalPage("terms");
    expect(
      screen.getByRole("heading", { name: "Termos de Uso", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /gamificação e mérito espiritual/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não representam, medem, concedem ou substituem/i),
    ).toBeInTheDocument();
  });

  it("exibe o título e as seções da Política de Privacidade", () => {
    renderLegalPage("privacy");
    expect(
      screen.getByRole("heading", {
        name: "Política de Privacidade",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /prazo de retenção dos dados/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/nunca vendemos seus dados a terceiros/i),
    ).toBeInTheDocument();
  });

  it("indica que a revisão jurídica formal ainda é pendente", () => {
    renderLegalPage("terms");
    expect(
      screen.getByText(/revisão formal de um\(a\) advogado\(a\)/i),
    ).toBeInTheDocument();
  });
});
