import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ProfilePage } from "./ProfilePage";

/** Entra em modo demonstração assim que monta — a página exige um `user`. */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <ProfilePage />;
}

function renderPerfil() {
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

describe("ProfilePage", () => {
  it("exibe nome, avatar e estatísticas do usuário", async () => {
    renderPerfil();
    expect(await screen.findByText("Visitante")).toBeInTheDocument();
    expect(screen.getByAltText(/Avatar de/)).toBeInTheDocument();
    expect(screen.getByText(/Nível/)).toBeInTheDocument();
  });

  it("modo demonstração explica que nenhum consentimento é coletado, sem pedir novo aceite", async () => {
    renderPerfil();
    expect(
      await screen.findByText(/Modo demonstração/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Aceitar termos/i),
    ).not.toBeInTheDocument();
  });

  it("tem um link pra editar o avatar", async () => {
    renderPerfil();
    expect(
      await screen.findByRole("link", { name: "Editar avatar" }),
    ).toHaveAttribute("href", "/avatar");
  });
});
