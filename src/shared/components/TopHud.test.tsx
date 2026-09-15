import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { criarUsuarioDeTeste } from "../../features/rpg/testUtils";
import { TopHud } from "./TopHud";

function renderTopHud(onSignOut = vi.fn()) {
  const user = criarUsuarioDeTeste({ name: "Ana" });
  render(
    <MemoryRouter>
      <TopHud user={user} onSignOut={onSignOut} />
    </MemoryRouter>,
  );
  return { onSignOut };
}

describe("TopHud", () => {
  it("o menu de contexto começa fechado", () => {
    renderTopHud();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("clicar no avatar abre o menu com Perfil e Sair", () => {
    renderTopHud();
    fireEvent.click(screen.getByRole("button", { name: "Menu de Ana" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const linkPerfil = screen.getByRole("menuitem", { name: /Perfil/ });
    expect(linkPerfil).toHaveAttribute("href", "/perfil");
    expect(
      screen.getByRole("menuitem", { name: /Sair/ }),
    ).toBeInTheDocument();
  });

  it("clicar em Sair fecha o menu e chama onSignOut", () => {
    const { onSignOut } = renderTopHud();
    fireEvent.click(screen.getByRole("button", { name: "Menu de Ana" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Sair/ }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("clicar em Perfil fecha o menu", () => {
    renderTopHud();
    fireEvent.click(screen.getByRole("button", { name: "Menu de Ana" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Perfil/ }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
