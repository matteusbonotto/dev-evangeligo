import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { ExerciciosPage } from "./ExerciciosPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ExerciciosPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("ExerciciosPage", () => {
  it("lista os exercícios disponíveis com link para cada um", () => {
    renderPage();

    const cacaPalavras = screen.getByText("Caça-palavras").closest("a");
    expect(cacaPalavras).toHaveAttribute("href", "/exercicios/caca-palavras");

    const termo = screen.getByText("Termo Bíblico").closest("a");
    expect(termo).toHaveAttribute("href", "/exercicios/termo");

    const quebraCabeca = screen.getByText("Quebra-cabeça").closest("a");
    expect(quebraCabeca).toHaveAttribute("href", "/exercicios/quebra-cabeca");
  });
});
