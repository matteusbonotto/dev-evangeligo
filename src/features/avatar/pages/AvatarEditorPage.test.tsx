import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import {
  AuthProvider,
  useAuth,
} from "../../authentication/context/AuthContext";
import { AvatarEditorPage } from "./AvatarEditorPage";

/** Entra em modo demonstração assim que monta — o editor exige um `user` (T-053). */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <AvatarEditorPage />;
}

function renderEditor() {
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

describe("AvatarEditorPage", () => {
  it("exibe a prévia do avatar e as categorias de customização", async () => {
    renderEditor();
    expect(
      await screen.findByAltText("Prévia do seu avatar"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cabelo")).toBeInTheDocument();
    expect(screen.getByText("Cor do cabelo")).toBeInTheDocument();
    expect(screen.getByText("Roupa")).toBeInTheDocument();
    expect(screen.getByText("Fundo")).toBeInTheDocument();
  });

  it("escolher uma opção de cabelo salva e marca como ativa", async () => {
    renderEditor();
    const opcaoSemCabelo = await screen.findByRole("button", {
      name: "Sem cabelo",
    });
    fireEvent.click(opcaoSemCabelo);

    expect(opcaoSemCabelo).toHaveAttribute("aria-pressed", "true");
  });

  it("escolher uma cor (swatch) marca a opção como ativa", async () => {
    renderEditor();
    await screen.findByAltText("Prévia do seu avatar");
    // "Preto" existe em 3 categorias (cabelo/barba/roupa); a de "Cor do
    // cabelo" vem primeiro no DOM (2ª categoria da página).
    const [swatchCabeloPreto] = screen.getAllByRole("button", {
      name: "Preto",
    });
    fireEvent.click(swatchCabeloPreto);

    expect(swatchCabeloPreto).toHaveAttribute("aria-pressed", "true");
  });

  it("a escolha sobrevive a um recarregamento da página (persistida via updateUser)", async () => {
    const { unmount } = renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: "Sem cabelo" }),
    );
    unmount();

    renderEditor();
    expect(
      await screen.findByRole("button", { name: "Sem cabelo" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
