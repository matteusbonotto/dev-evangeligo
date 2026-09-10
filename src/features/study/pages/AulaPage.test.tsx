import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { AULAS, TRILHAS } from "../content";
import { AulaPage } from "./AulaPage";

function renderAulaPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/trilhas/:trilhaSlug/aulas/:aulaId"
            element={<AulaPage />}
          />
          <Route path="/trilhas" element={<p>Lista de trilhas</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AulaPage", () => {
  it("exibe título, resumo e referências bíblicas da aula", () => {
    const trilha = TRILHAS.find((item) => item.id === "solas")!;
    const aula = AULAS.find((item) => item.id === "solas-1")!;

    renderAulaPage(`/trilhas/${trilha.slug}/aulas/${aula.id}`);

    expect(
      screen.getByRole("heading", { name: aula.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(aula.summary)).toBeInTheDocument();
    for (const ref of aula.bibleReferences) {
      expect(screen.getByText(ref.display)).toBeInTheDocument();
    }
  });

  it("mostra o link para a próxima aula quando existir", () => {
    const aula = AULAS.find((item) => item.id === "solas-1")!;
    renderAulaPage(`/trilhas/solas/aulas/${aula.id}`);

    expect(
      screen.getByRole("link", { name: /próxima aula/i }),
    ).toBeInTheDocument();
  });

  it("redireciona para /trilhas quando a aula não existe", () => {
    renderAulaPage("/trilhas/solas/aulas/aula-inexistente");

    expect(screen.getByText("Lista de trilhas")).toBeInTheDocument();
  });
});
