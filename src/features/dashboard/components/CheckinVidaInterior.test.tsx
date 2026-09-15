import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../authentication/context/AuthContext";
import { CheckinVidaInterior } from "./CheckinVidaInterior";

/** Entra em modo demonstração assim que monta; marca quando `user` já carregou. */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return (
    <>
      <span data-testid="usuario-pronto" />
      <CheckinVidaInterior />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("CheckinVidaInterior", () => {
  it("não aparece pra conta demonstração (sem sessão real pra registrar check-in)", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ComDemoAtivo />
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByTestId("usuario-pronto");
    expect(screen.queryByText("Vida Interior")).not.toBeInTheDocument();
    expect(screen.queryByText(/pares esta semana/)).not.toBeInTheDocument();
  });
});
