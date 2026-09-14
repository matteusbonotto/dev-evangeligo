import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  // O GitHub Pages publica este projeto em /dev-evangeligo/, enquanto no
  // desenvolvimento local ele continua disponível na raiz.
  base: mode === "github-pages" ? "/dev-evangeligo/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Bíblia/Harpa (public/data/*.json, T-011/T-012) NÃO entram no
        // pré-cache da instalação (ficariam ~4.5MB a mais no primeiro
        // download do app) — cacheadas sob demanda na primeira leitura via
        // CacheFirst, disponíveis offline a partir daí.
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "evangeligo-conteudo",
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "EvangeliGO",
        short_name: "EvangeliGO",
        description: "App gamificado de Teologia Cristã Reformada Calvinista.",
        theme_color: "#25633b",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "./",
        icons: [
          {
            src: "./pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // `e2e/*.spec.ts` são testes Playwright (T-019), não Vitest — o glob
    // padrão do Vitest também casa com `*.spec.ts`, então precisa ser
    // excluído explicitamente (senão falha ao tentar rodar `test.describe`
    // do `@playwright/test` como se fosse `describe` do Vitest).
    // `.claude/worktrees/**` são cópias temporárias do repositório usadas
    // por agentes em sessões passadas (não fazem parte do código do
    // projeto, já ignoradas pelo git) — sem excluir aqui, `npm run test`
    // roda a suíte inteira várias vezes (uma por worktree encontrada).
    exclude: [...configDefaults.exclude, "e2e/**", ".claude/**"],
    // Testes precisam ser determinísticos independente de `.env.local` do
    // desenvolvedor (ex.: credenciais reais do Supabase) — sem isso, um
    // `.env.local` preenchido muda silenciosamente qual caminho de código
    // os testes exercitam (ex.: SignUpPage.test.tsx espera explicitamente
    // o cenário "Supabase não configurado").
    env: {
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_ANON_KEY: "",
    },
  },
}));
