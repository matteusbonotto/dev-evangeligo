import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../authentication/context/AuthContext";
import { VidaInteriorHistoricoPage } from "./VidaInteriorHistoricoPage";

/** Entra em modo demonstração assim que monta — a página exige um `user`. */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <VidaInteriorHistoricoPage />;
}

function renderPagina() {
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

describe("VidaInteriorHistoricoPage", () => {
  it("mostra os períodos fake da conta demonstração num seletor", async () => {
    renderPagina();
    expect(await screen.findByText("Histórico — Vida Interior")).toBeInTheDocument();
    const selectPeriodo = screen.getByLabelText("Período");
    expect(selectPeriodo.querySelectorAll("option")).toHaveLength(2);
  });

  it("filtrar por um par específico mostra só aquele par na barra", async () => {
    renderPagina();
    await screen.findByText("Histórico — Vida Interior");

    fireEvent.change(screen.getByLabelText("Par"), { target: { value: "amor" } });

    expect(document.querySelectorAll(".sb-row")).toHaveLength(1);
    expect(document.querySelector(".sb-list")).not.toHaveTextContent("Longanimidade");
  });

  it("trocar de período muda os números mostrados", async () => {
    renderPagina();
    await screen.findByText("Histórico — Vida Interior");
    fireEvent.change(screen.getByLabelText("Par"), { target: { value: "amor" } });

    const textoInicial = screen.getByRole("status").textContent;

    const selectPeriodo = screen.getByLabelText("Período");
    const outraOpcao = Array.from(
      selectPeriodo.querySelectorAll("option"),
    ).find((o) => o.value !== (selectPeriodo as HTMLSelectElement).value)!;
    fireEvent.change(selectPeriodo, { target: { value: outraOpcao.value } });

    expect(screen.getByRole("status").textContent).not.toBe(textoInicial);
  });
});
