# Deploy

Deploy do frontend (Vite) e do Supabase. Verificar o CI/CD configurado (`.github/workflows/`).

- Frontend: build + deploy estático (Netlify/Vercel/Supabase Hosting).
- Banco: `supabase db push` para aplicar migrations.
- Secrets: configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de produção.
