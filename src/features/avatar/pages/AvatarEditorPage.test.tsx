import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { obterConfigAvatar } from "../avatarConfig";
import { AvatarEditorPage } from "./AvatarEditorPage";

function renderEditor() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AvatarEditorPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AvatarEditorPage", () => {
  it("exibe a prévia do avatar e as categorias de customização", () => {
    renderEditor();
    expect(screen.getByAltText("Prévia do seu avatar")).toBeInTheDocument();
    expect(screen.getByText("Cabelo")).toBeInTheDocument();
    expect(screen.getByText("Cor do cabelo")).toBeInTheDocument();
    expect(screen.getByText("Roupa")).toBeInTheDocument();
    expect(screen.getByText("Fundo")).toBeInTheDocument();
  });

  it("escolher uma opção de cabelo salva e marca como ativa", () => {
    renderEditor();
    const opcaoSemCabelo = screen.getByRole("button", { name: "Sem cabelo" });
    fireEvent.click(opcaoSemCabelo);

    expect(opcaoSemCabelo).toHaveAttribute("aria-pressed", "true");
    expect(obterConfigAvatar().topType).toBe("NoHair");
  });

  it("escolher uma cor (swatch) salva o valor selecionado", () => {
    renderEditor();
    // "Preto" existe em 3 categorias (cabelo/barba/roupa); a de "Cor do
    // cabelo" vem primeiro no DOM (2ª categoria da página).
    const [swatchCabeloPreto] = screen.getAllByRole("button", {
      name: "Preto",
    });
    fireEvent.click(swatchCabeloPreto);

    expect(obterConfigAvatar().hairColor).toBe("Black");
  });

  it("carrega a configuração já salva ao abrir a página", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Sem cabelo" }));

    renderEditor();
    expect(
      screen.getAllByRole("button", { name: "Sem cabelo" })[1],
    ).toHaveAttribute("aria-pressed", "true");
  });
});
