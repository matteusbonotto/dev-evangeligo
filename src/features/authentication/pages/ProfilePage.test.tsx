import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { obterPreferenciaVLibras } from "../../../shared/preferencias";
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

  /**
   * T-073 — pedido explícito do usuário depois de várias rodadas sem
   * conseguir corrigir o VLibras de forma confiável: um switch em Perfil
   * pra desligar o widget inteiro (não só escondê-lo).
   */
  describe("switch do VLibras", () => {
    it("vem ligado por padrão e desliga a preferência salva ao clicar, avisando que precisa recarregar", async () => {
      renderPerfil();
      const interruptor = await screen.findByRole("switch", {
        name: "VLibras (tradução em Libras)",
      });
      expect(interruptor).toHaveAttribute("aria-checked", "true");

      fireEvent.click(interruptor);

      expect(interruptor).toHaveAttribute("aria-checked", "false");
      expect(obterPreferenciaVLibras()).toBe(false);
      expect(
        screen.getByText(/só faz efeito depois de recarregar/i),
      ).toBeInTheDocument();
    });
  });

  describe("switch de notificações", () => {
    it("vem desligado por padrão e pede permissão do navegador ao ligar", async () => {
      const requestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", { requestPermission });

      renderPerfil();
      const interruptor = await screen.findByRole("switch", {
        name: "Notificações push",
      });
      expect(interruptor).toHaveAttribute("aria-checked", "false");

      fireEvent.click(interruptor);
      expect(requestPermission).toHaveBeenCalled();

      expect(await screen.findByRole("switch", { name: "Notificações push" })).toHaveAttribute(
        "aria-checked",
        "true",
      );

      vi.unstubAllGlobals();
    });

    it("não liga de verdade se o navegador negar a permissão", async () => {
      const requestPermission = vi.fn().mockResolvedValue("denied");
      vi.stubGlobal("Notification", { requestPermission });

      renderPerfil();
      const interruptor = await screen.findByRole("switch", {
        name: "Notificações push",
      });
      fireEvent.click(interruptor);

      await vi.waitFor(() =>
        expect(
          screen.getByRole("switch", { name: "Notificações push" }),
        ).toHaveAttribute("aria-checked", "false"),
      );

      vi.unstubAllGlobals();
    });
  });
});
