import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { OnboardingPage } from "./OnboardingPage";

function renderOnboardingPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <OnboardingPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function avancar() {
  const form = document.querySelector("form")!;
  fireEvent.click(
    within(form).getByRole("button", { name: /^Continuar$|Concluir cadastro/ }),
  );
}

/** Percorre os passos 0-4 (boas-vindas até senha) preenchendo tudo corretamente. */
function preencherAteEstadoCivil() {
  fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
  fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
  avancar();

  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Maria" } });
  avancar();

  avancar(); // nascimento — opcional, pula sem preencher

  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "maria@exemplo.com" },
  });
  avancar();

  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "Senha123" },
  });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), {
    target: { value: "Senha123" },
  });
  avancar();
}

describe("OnboardingPage", () => {
  it("exibe o passo 1 de 7 com o título de boas-vindas", () => {
    renderOnboardingPage();
    expect(
      screen.getByRole("heading", { name: /Bem-vindo\(a\) ao EvangeliGO/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 7")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Progresso do cadastro" }),
    ).toHaveAttribute("aria-valuenow", "14");
  });

  it("não avança sem aceitar termos e privacidade", () => {
    renderOnboardingPage();
    avancar();
    expect(
      screen.getByText("É necessário aceitar os Termos de Uso."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("É necessário aceitar a Política de Privacidade."),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 7")).toBeInTheDocument();
  });

  it("não mostra o botão Voltar no primeiro passo, mas mostra a partir do segundo", () => {
    renderOnboardingPage();
    expect(
      screen.queryByRole("button", { name: "Voltar ao passo anterior" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
    avancar();

    expect(
      screen.getByRole("button", { name: "Voltar ao passo anterior" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 / 7")).toBeInTheDocument();
  });

  it("Voltar retorna ao passo anterior preservando o que já foi digitado", () => {
    renderOnboardingPage();
    fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
    avancar();

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Maria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao passo anterior" }));

    expect(screen.getByText("1 / 7")).toBeInTheDocument();
    expect(screen.getByLabelText(/Termos de Uso/i)).toBeChecked();

    avancar();
    expect(screen.getByLabelText("Nome")).toHaveValue("Maria");
  });

  it("nome é obrigatório, sobrenome não", () => {
    renderOnboardingPage();
    fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
    avancar();

    avancar();
    expect(
      screen.getByText("Informe pelo menos 2 caracteres."),
    ).toBeInTheDocument();
  });

  it("o passo de nascimento pode ser pulado sem preencher nada", () => {
    renderOnboardingPage();
    fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
    avancar();
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Maria" },
    });
    avancar();

    expect(screen.getByText("3 / 7")).toBeInTheDocument();
    avancar(); // não preenche nascimento
    expect(screen.getByText("4 / 7")).toBeInTheDocument();
  });

  it("rejeita senhas que não coincidem", () => {
    renderOnboardingPage();
    fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
    avancar();
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Maria" },
    });
    avancar();
    avancar();
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "maria@exemplo.com" },
    });
    avancar();

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Senha123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "Outra123" },
    });
    avancar();

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(screen.getByText("5 / 7")).toBeInTheDocument();
  });

  it("selecionar um estado civil avança automaticamente para o próximo passo", () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();

    expect(screen.getByText("6 / 7")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Casado(a)" }));

    expect(screen.getByText("7 / 7")).toBeInTheDocument();
  });

  it("objetivo é obrigatório para concluir o cadastro", () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();
    avancar(); // pula estado civil sem escolher

    expect(screen.getByText("7 / 7")).toBeInTheDocument();
    avancar();

    expect(
      screen.getByText("Escolha um objetivo para continuar."),
    ).toBeInTheDocument();
  });

  it("completar todos os 7 passos tenta criar a conta (sem Supabase configurado no teste)", async () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();
    avancar(); // pula estado civil

    fireEvent.click(
      screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
    );
    avancar();

    expect(
      await screen.findByText(/Autenticação por e-mail indisponível/i),
    ).toBeInTheDocument();
  });
});
