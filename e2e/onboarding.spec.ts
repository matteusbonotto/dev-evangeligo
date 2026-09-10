import { expect, test } from "@playwright/test";

/**
 * E2E do fluxo crítico de onboarding (T-006, `IA/docs/testing.md`: um dos
 * 3 fluxos citados explicitamente). Cobre navegação, validação por passo,
 * botão voltar e preservação de dados entre passos — todo o comportamento
 * de UI do wizard (`OnboardingPage.tsx`).
 *
 * Deliberadamente NÃO clica em "Concluir cadastro": isso dispara uma
 * chamada real a `supabase.auth.signUp()`, que em ambiente com Supabase
 * configurado (`.env.local`) criaria uma conta de verdade e esbarraria no
 * limite de taxa de e-mail do provedor (já visto na verificação manual
 * desta feature, ver ADR-025) — e em CI sem `.env.local`, o comportamento
 * seria diferente (mensagem de indisponibilidade) só por causa do
 * ambiente, não da lógica testada. A criação de conta em si já foi
 * verificada contra o banco real fora da suíte de E2E (ADR-025).
 */
test.describe("Onboarding (7 passos)", () => {
  test("percorre os 7 passos, valida campos obrigatórios e preserva dados ao voltar", async ({
    page,
  }) => {
    await page.goto("/cadastro");
    await expect(
      page.getByRole("heading", { name: /Bem-vindo\(a\) ao EvangeliGO/ }),
    ).toBeVisible();
    await expect(page.getByText("1 / 7")).toBeVisible();

    // Passo 1: não avança sem aceitar os dois documentos.
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(
      page.getByText("É necessário aceitar os Termos de Uso."),
    ).toBeVisible();

    await page.locator('label:has-text("Termos de Uso") input[type="checkbox"]').check();
    await page
      .locator('label:has-text("Política de Privacidade") input[type="checkbox"]')
      .check();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("2 / 7")).toBeVisible();

    // Passo 2: nome.
    await page.getByLabel("Nome", { exact: true }).fill("QA E2E");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("3 / 7")).toBeVisible();

    // Passo 3: nascimento — opcional, pula sem preencher.
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("4 / 7")).toBeVisible();

    // Passo 4: e-mail.
    await page.getByLabel("E-mail").fill("qa.e2e@exemplo.com");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("5 / 7")).toBeVisible();

    // Passo 5: senha — mostra o indicador de força e valida confirmação.
    await page.getByLabel("Senha", { exact: true }).fill("SenhaForte123");
    await expect(page.getByText(/Força da senha/)).toBeVisible();
    await page.getByLabel("Confirmar senha").fill("SenhaDiferente");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
    await expect(page.getByText("5 / 7")).toBeVisible();

    await page.getByLabel("Confirmar senha").fill("SenhaForte123");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("6 / 7")).toBeVisible();

    // Passo 6: estado civil — opcional, clicar num card avança sozinho.
    await page.getByRole("button", { name: "Casado(a)" }).click();
    await expect(page.getByText("7 / 7")).toBeVisible();

    // Voltar preserva a escolha anterior.
    await page.getByRole("button", { name: "Voltar ao passo anterior" }).click();
    await expect(page.getByText("6 / 7")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Casado(a)" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText("7 / 7")).toBeVisible();

    // Passo 7: objetivo é obrigatório para concluir.
    await page
      .getByRole("button", { name: "Concluir cadastro" })
      .click();
    await expect(
      page.getByText("Escolha um objetivo para continuar."),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Aprofundar em teologia reformada" })
      .click();
    await expect(
      page.getByRole("button", { name: "Aprofundar em teologia reformada" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Nome digitado no passo 2 continua no estado do formulário: volta
    // até lá para confirmar (6 cliques em "Voltar").
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Voltar ao passo anterior" }).click();
    }
    await expect(page.getByText("2 / 7")).toBeVisible();
    await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("QA E2E");
  });
});
