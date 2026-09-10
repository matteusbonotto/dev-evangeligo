import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { CapitulosPage } from "./CapitulosPage";

function renderCapitulosPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/biblia/:livroCodigo" element={<CapitulosPage />} />
          <Route path="/biblia" element={<p>Lista de livros</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("CapitulosPage", () => {
  it("exibe o nome do livro e a grade com todos os capítulos", () => {
    renderCapitulosPage("/biblia/gen");
    expect(
      screen.getByRole("heading", { name: "Gênesis" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "href",
      "/biblia/gen/1",
    );
    expect(screen.getByRole("link", { name: "50" })).toBeInTheDocument();
  });

  it("aceita o código do livro em minúsculas ou maiúsculas", () => {
    renderCapitulosPage("/biblia/PSA");
    expect(screen.getByRole("heading", { name: "Salmos" })).toBeInTheDocument();
  });

  it("redireciona para /biblia quando o código do livro não existe", () => {
    renderCapitulosPage("/biblia/xxx");
    expect(screen.getByText("Lista de livros")).toBeInTheDocument();
  });
});
