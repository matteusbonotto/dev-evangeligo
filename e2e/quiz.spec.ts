import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

/**
 * E2E do fluxo crítico de quiz (T-008, `IA/docs/ux-ui.md`: "pergunta →
 * alternativas → feedback imediato → explicação + referência bíblica →
 * próximo"). Navega pela primeira aula da primeira trilha em vez de fixar
 * um slug/título de conteúdo — só a primeira aula de cada trilha tem quiz
 * (`aula.quizId`), e o texto do conteúdo pode mudar sem quebrar o teste.
 */
test.describe("Quiz de uma aula", () => {
  test("responder até o resultado final", async ({ page }) => {
    await loginAsDemo(page);

    await page.getByRole("link", { name: /Trilhas/ }).click();
    await page.waitForURL("**/trilhas");
    await page
      .locator(".trilha-card")
      .first()
      .locator(".trilha-aula-item a")
      .first()
      .click();

    await page.getByRole("link", { name: "Fazer o quiz desta aula" }).click();
    await page.waitForSelector(".quiz-prompt");

    // Responde perguntas até chegar ao resultado (perde de propósito
    // quando possível para também exercitar o caminho "sem corações" —
    // aqui só garantimos progresso: sempre marca a primeira alternativa
    // disponível, qualquer que seja o tipo de pergunta.
    for (let tentativas = 0; tentativas < 20; tentativas++) {
      const resultado = page.locator(".quiz-results");
      if (await resultado.isVisible().catch(() => false)) break;

      const feedbackButton = page.getByRole("button", {
        name: /Próxima pergunta|Ver resultado/,
      });
      if (await feedbackButton.isVisible().catch(() => false)) {
        await feedbackButton.click();
        continue;
      }

      const primeiraOpcao = page
        .locator('[role="radio"], [role="checkbox"]')
        .first();
      await primeiraOpcao.click();
      await page.getByRole("button", { name: "Responder" }).click();
    }

    await expect(page.locator(".quiz-results")).toBeVisible();
    await expect(page.locator(".quiz-results-score")).toBeVisible();
  });
});
