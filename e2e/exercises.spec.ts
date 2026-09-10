import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

/**
 * E2E dos exercícios extras (T-034/T-035). Cobre o quebra-cabeça (a
 * interação mais recente e mais fácil de regredir silenciosamente — monta
 * a frase tocando fichas embaralhadas) de ponta a ponta contra o texto
 * real migrado da Bíblia.
 */
test.describe("Exercícios", () => {
  test("hub lista os 3 tipos de exercício", async ({ page }) => {
    await loginAsDemo(page);
    await page.getByRole("link", { name: /Exercícios/ }).click();
    await page.waitForURL("**/exercicios");

    await expect(page.getByRole("heading", { name: "Caça-palavras" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Termo Bíblico" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quebra-cabeça" })).toBeVisible();
  });

  test("quebra-cabeça: montar o desafio mais curto na ordem certa vence", async ({
    page,
  }) => {
    await loginAsDemo(page);
    await page.goto("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await page.waitForSelector(
      '[role="group"][aria-label="Banco de palavras"] button',
    );

    // "Posso todas as coisas n'aquelle que me fortalece." — texto real do
    // JSON migrado (Almeida, ortografia antiga preservada de propósito).
    const palavras = [
      "Posso",
      "todas",
      "as",
      "coisas",
      "n'aquelle",
      "que",
      "me",
      "fortalece.",
    ];
    const banco = page.getByRole("group", { name: "Banco de palavras" });
    for (const palavra of palavras) {
      await banco.getByRole("button", { name: palavra, exact: true }).click();
    }

    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page.getByRole("heading", { name: "Você acertou!" })).toBeVisible();
    await expect(page.getByText("+50 XP · +25 ouro")).toBeVisible();
  });
});
