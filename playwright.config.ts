import { defineConfig, devices } from "@playwright/test";

/**
 * E2E (T-019, `IA/docs/testing.md`): "fluxos críticos (onboarding, quiz,
 * missão) desktop/mobile" — "missão" ainda não tem UI própria (T-010,
 * `todo`), substituído aqui pela leitura bíblica (RF-09, o outro fluxo de
 * maior profundidade de interação já construído: seleção real de texto).
 *
 * `webServer` sobe o Vite dev server automaticamente se nenhum já estiver
 * rodando em 5173 (`reuseExistingServer` evita conflito com um servidor já
 * aberto durante desenvolvimento).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
