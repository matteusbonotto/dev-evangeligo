import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

/**
 * E2E do fluxo crítico de leitura bíblica (RF-09, T-032): selecionar um
 * trecho real de texto (`window.getSelection()`/`Range`, não jsdom) e
 * marcar/editar/excluir uma anotação — a interação mais sensível a
 * regressão de todo o app (ver ADR-021, bug real de offset já corrigido
 * aqui uma vez).
 */
test.describe("Leitura bíblica: marcações", () => {
  test("selecionar um trecho, marcar, editar e excluir", async ({ page }) => {
    await loginAsDemo(page);

    await page.getByRole("link", { name: /Bíblia/ }).click();
    await page.waitForURL("**/biblia");
    await page.getByRole("link", { name: "João 0%", exact: true }).click();
    await page.waitForURL("**/biblia/jhn");
    await page.locator(".biblia-capitulo-btn", { hasText: "1" }).first().click();
    await page.waitForURL("**/biblia/jhn/1");
    await page.waitForSelector('[data-verso="1"]');

    const textoSelecionado = await page.evaluate(() => {
      const container = document.querySelector('[data-verso="1"]')!;
      const textoEl = container.querySelector(".biblia-versiculo-texto")!;
      const textNode = textoEl.childNodes[0];
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 2);
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      document
        .querySelector(".biblia-paper")!
        .dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      return textNode.textContent!.slice(0, 2);
    });
    expect(textoSelecionado).toBe("No");

    await page.getByRole("dialog", { name: "Marcação do versículo" }).waitFor();
    await page.getByLabel("Marca-texto amarelo").click();
    await page.getByRole("button", { name: "Salvar" }).click();

    const marca = page.locator(".biblia-marca--amarelo").first();
    await expect(marca).toBeVisible();
    await expect(marca).toHaveText("No");

    // Reabre em modo de edição e confirma o botão Excluir aparece.
    await marca.click();
    await expect(page.getByText("Versículo 1 · editando")).toBeVisible();
    await page.getByRole("button", { name: "Excluir" }).click();

    await expect(page.locator(".biblia-marca--amarelo")).toHaveCount(0);
  });

  test("progresso de leitura sobe ao rolar até o fim do capítulo", async ({
    page,
  }) => {
    await loginAsDemo(page);
    await page.goto("/biblia/jhn/1");
    await page.waitForSelector('[data-verso="1"]');

    const barra = page.getByRole("progressbar", { name: /Progresso de leitura/ });
    await expect(barra).toHaveAttribute("aria-valuenow", "0");

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      window.dispatchEvent(new Event("scroll"));
    });
    await expect(barra).toHaveAttribute("aria-valuenow", "100");

    // Rolar de volta ao topo NÃO diminui o progresso salvo (ADR-019).
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event("scroll"));
    });
    await expect(barra).toHaveAttribute("aria-valuenow", "100");
  });
});
