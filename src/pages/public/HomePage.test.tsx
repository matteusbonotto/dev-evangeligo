import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  AuthProvider,
  useAuth,
} from "../../features/authentication/context/AuthContext";
import { HomePage } from "./HomePage";

function renderHomePage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

/** Entra em modo demonstração assim que monta — simula uma sessão já ativa. */
function EntrarComoDemo() {
  const { signInDemo } = useAuth();
  useEffect(() => {
    signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <HomePage />;
}

function renderHomePageJaAutenticado() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<EntrarComoDemo />} />
          <Route path="/jornada" element={<div>Painel autenticado</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  it("exibe o título principal", () => {
    renderHomePage();
    expect(
      screen.getByRole("heading", {
        name: /uma jornada bíblica que respeita o seu ritmo/i,
      }),
    ).toBeInTheDocument();
  });

  it("exibe os princípios", () => {
    renderHomePage();
    expect(screen.getByText("Palavra em primeiro lugar")).toBeInTheDocument();
    expect(screen.getByText("Privacidade real")).toBeInTheDocument();
  });

  it("usuário já autenticado (demo) é redirecionado direto pro painel, nunca vê a landing page (T-052)", async () => {
    renderHomePageJaAutenticado();
    expect(await screen.findByText("Painel autenticado")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /uma jornada bíblica que respeita o seu ritmo/i,
      }),
    ).not.toBeInTheDocument();
  });
});
