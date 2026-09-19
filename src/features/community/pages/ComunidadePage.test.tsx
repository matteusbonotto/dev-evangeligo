import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../authentication/context/AuthContext";
import { ComunidadePage } from "./ComunidadePage";

/** Entra em modo demonstração assim que monta (mesmo padrão de ProfilePage.test.tsx). */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <ComunidadePage />;
}

function renderComunidade() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ComDemoAtivo />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ComunidadePage", () => {
  /**
   * T-014 — modo demonstração não tem amigos/chat reais (dados nunca
   * persistidos), então a busca/lista de amigos nem aparece.
   */
  it("explica que a Comunidade não está disponível no modo demonstração", async () => {
    renderComunidade();
    expect(
      await screen.findByText(/Comunidade só está disponível para contas reais/),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Buscar por nome…")).not.toBeInTheDocument();
  });

  it("exibe o título e o link de voltar para o painel", async () => {
    renderComunidade();
    expect(await screen.findByRole("heading", { name: "Amigos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Painel/ })).toHaveAttribute("href", "/jornada");
  });
});
