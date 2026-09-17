import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import {
  obterPreferenciaNotificacoes,
  obterPreferenciaVLibras,
} from "../../../shared/preferencias";
import { OnboardingPage } from "./OnboardingPage";

beforeEach(() => {
  localStorage.clear();
});

function renderOnboardingPage(path = "/cadastro") {
  return render(
    <MemoryRouter initialEntries={[path]}>
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
  it("exibe o passo 1 de 10 com o título de boas-vindas", () => {
    renderOnboardingPage();
    expect(
      screen.getByRole("heading", { name: /Bem-vindo\(a\) ao EvangeliGO/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 10")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Progresso do cadastro" }),
    ).toHaveAttribute("aria-valuenow", "10");
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
    expect(screen.getByText("1 / 10")).toBeInTheDocument();
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
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
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

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
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

    expect(screen.getByText("3 / 10")).toBeInTheDocument();
    avancar(); // não preenche nascimento
    expect(screen.getByText("4 / 10")).toBeInTheDocument();
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
    expect(screen.getByText("5 / 10")).toBeInTheDocument();
  });

  it("selecionar um estado civil avança automaticamente para o próximo passo", () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();

    expect(screen.getByText("6 / 10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Casado(a)" }));

    expect(screen.getByText("7 / 10")).toBeInTheDocument();
  });

  it("objetivo é obrigatório para concluir o cadastro", () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();
    avancar(); // pula estado civil sem escolher

    expect(screen.getByText("7 / 10")).toBeInTheDocument();
    avancar();

    expect(
      screen.getByText("Escolha um objetivo para continuar."),
    ).toBeInTheDocument();
  });

  it("completar todos os 10 passos tenta criar a conta (sem Supabase configurado no teste)", async () => {
    renderOnboardingPage();
    preencherAteEstadoCivil();
    avancar(); // pula estado civil

    fireEvent.click(
      screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
    );
    avancar();
    fireEvent.click(screen.getByRole("button", { name: "Não" })); // Libras
    fireEvent.click(screen.getByRole("button", { name: "Não" })); // notificações
    avancar(); // avatar — opcional, pula sem escolher

    expect(
      await screen.findByText(/Autenticação por e-mail indisponível/i),
    ).toBeInTheDocument();
  });

  /**
   * T-077 — pedido explícito do usuário: onboarding nunca perguntava
   * sobre Libras (VLibras) nem notificações push, mesmo os 2 já existindo
   * como preferência avulsa (T-073, `shared/preferencias.ts`).
   */
  describe("passos novos: Libras e notificações (T-077)", () => {
    it("escolher 'Sim' em Libras liga a preferência e avança sozinho", () => {
      renderOnboardingPage();
      preencherAteEstadoCivil();
      avancar(); // pula estado civil
      fireEvent.click(
        screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
      );
      avancar();

      expect(screen.getByText("8 / 10")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Você usa Libras?" }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Sim" }));

      expect(obterPreferenciaVLibras()).toBe(true);
      expect(screen.getByText("9 / 10")).toBeInTheDocument();
    });

    it("escolher 'Não' em Libras desliga a preferência", () => {
      renderOnboardingPage();
      preencherAteEstadoCivil();
      avancar();
      fireEvent.click(
        screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
      );
      avancar();

      fireEvent.click(screen.getByRole("button", { name: "Não" }));

      expect(obterPreferenciaVLibras()).toBe(false);
    });

    it("escolher 'Sim' em notificações pede a permissão do navegador e só liga se concedida", async () => {
      const requestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", { requestPermission });

      renderOnboardingPage();
      preencherAteEstadoCivil();
      avancar();
      fireEvent.click(
        screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
      );
      avancar();
      fireEvent.click(screen.getByRole("button", { name: "Não" })); // Libras

      expect(
        screen.getByRole("heading", { name: "Quer receber notificações?" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Sim" }));

      expect(requestPermission).toHaveBeenCalled();
      await screen.findByRole("heading", { name: "Personalize seu avatar" });
      expect(obterPreferenciaNotificacoes()).toBe(true);

      avancar(); // avatar — opcional, pula sem escolher
      await screen.findByText(/Autenticação por e-mail indisponível/i);

      vi.unstubAllGlobals();
    });

    it("navegador sem suporte a Notification nunca finge que a permissão foi concedida", async () => {
      renderOnboardingPage();
      preencherAteEstadoCivil();
      avancar();
      fireEvent.click(
        screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
      );
      avancar();
      fireEvent.click(screen.getByRole("button", { name: "Não" })); // Libras
      fireEvent.click(screen.getByRole("button", { name: "Sim" })); // notificações, sem suporte no jsdom

      await screen.findByRole("heading", { name: "Personalize seu avatar" });
      expect(obterPreferenciaNotificacoes()).toBe(false);

      avancar(); // avatar — opcional, pula sem escolher
      await screen.findByText(/Autenticação por e-mail indisponível/i);
    });
  });

  describe("modo Google (?google=1, T-043/ADR-037)", () => {
    it("pula nome, e-mail e senha — só 7 passos no total", () => {
      renderOnboardingPage("/cadastro?google=1");
      expect(screen.getByText("1 / 7")).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
      fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
      avancar();

      // Pulou direto pro passo de nascimento (índice 2), não nome (índice 1).
      expect(screen.getByText("2 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Quando você nasceu\?/ }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    });

    it("não mostra o botão \"Continuar com o Google\" (já está autenticado via Google)", () => {
      renderOnboardingPage("/cadastro?google=1");
      expect(
        screen.queryByRole("button", { name: /Continuar com o Google/ }),
      ).not.toBeInTheDocument();
    });

    it("Voltar a partir do nascimento retorna direto pros termos (pula nome)", () => {
      renderOnboardingPage("/cadastro?google=1");
      fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
      fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
      avancar();
      expect(screen.getByText("2 / 7")).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: "Voltar ao passo anterior" }),
      );
      expect(screen.getByText("1 / 7")).toBeInTheDocument();
      expect(screen.getByLabelText(/Termos de Uso/i)).toBeChecked();
    });

    it("chegando no último passo (avatar) tenta concluir via Google, não por senha", async () => {
      renderOnboardingPage("/cadastro?google=1");
      fireEvent.click(screen.getByLabelText(/Termos de Uso/i));
      fireEvent.click(screen.getByLabelText(/Política de Privacidade/i));
      avancar();
      avancar(); // nascimento — opcional, pula
      expect(screen.getByText("3 / 7")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Casado(a)" }));
      expect(screen.getByText("4 / 7")).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: "Aprofundar em teologia reformada" }),
      );
      avancar();
      fireEvent.click(screen.getByRole("button", { name: "Não" })); // Libras
      fireEvent.click(screen.getByRole("button", { name: "Não" })); // notificações
      avancar(); // avatar — opcional, pula sem escolher

      // Sem Supabase configurado no teste, `completarCadastroGoogle` falha
      // graciosamente (mesma mensagem genérica de indisponibilidade dos
      // outros métodos) em vez de travar a tela ou lançar — o importante
      // aqui é que o caminho do Google (e não `signUpWithPassword`) foi de
      // fato chamado, sem nunca precisar de e-mail/senha em nenhum passo
      // anterior (já coberto pelos testes acima).
      expect(
        await screen.findByText(/Autenticação por e-mail indisponível/i),
      ).toBeInTheDocument();
    });
  });
});
