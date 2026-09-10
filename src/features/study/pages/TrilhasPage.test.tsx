import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { TRILHAS } from "../content";
import { TrilhasPage } from "./TrilhasPage";

function renderTrilhasPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TrilhasPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("TrilhasPage", () => {
  it("lista as 5 trilhas de estudo com seus títulos", () => {
    renderTrilhasPage();

    for (const trilha of TRILHAS) {
      expect(
        screen.getByRole("heading", { name: trilha.title }),
      ).toBeInTheDocument();
    }
  });

  it("lista os títulos das aulas como links de navegação", () => {
    renderTrilhasPage();

    expect(
      screen.getByRole("link", { name: /sola scriptura/i }),
    ).toBeInTheDocument();
  });
});
