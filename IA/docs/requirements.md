# Requisitos

## Requisitos funcionais

### Autenticação e onboarding
- RF-01: Cadastro com onboarding estilo Duolingo (boas-vindas/termos, nome, nascimento, e-mail, senha, estado civil, objetivo).
- RF-02: Login por e-mail/senha.
- RF-03: Login com Google (OAuth).
- RF-04: Recuperação de senha.
- RF-05: Modo demonstração (acesso ao jogo completo sem conta).
- RF-06: Consentimento explícito de Termos e Política de Privacidade (auditável).

### Estudo bíblico
- RF-07: Trilhas de estudo (Solas, TULIP, Soberania, Pactos, Obras/Fruto).
- RF-08: Aulas com conteúdo, vídeos, materiais e quizzes.
- RF-09: Bíblia Almeida completa com leitura, marcações e notas.
- RF-10: Harpa Cristã (hinos).
- RF-11: Quiz com corações/vidas e Escudo da Fé (20% proteção).

### Gamificação
- RF-12: XP, níveis, ouro.
- RF-13: Sequências diárias (streaks).
- RF-14: Conquistas (comum/raro/épico/lendário).
- RF-15: Missões (6 tipos: humana, espiritual, conhecimento, tarefa, casal, colaborativa).
- RF-16: Recompensas (XP, ouro, itens).

### RPG
- RF-17: Armadura de Deus (6 peças, Efésios 6).
- RF-18: Itens (permanentes, consumíveis, armadura), inventário, loja.

### Social
- RF-19: Feed de devocionais.
- RF-20: Chat com amigos.
- RF-21: Missões colaborativas e convites.

### Administração
- RF-22: Painel admin (CRUD de conteúdo e usuários).

### Acessibilidade
- RF-23: VLibras (Libras).
- RF-24: Conformidade WCAG AA.

### PWA
- RF-25: Instalável, offline, manifest e service worker.

## Requisitos não funcionais
- RNF-01: TypeScript estrito, sem `any`.
- RNF-02: RLS em todas as tabelas.
- RNF-03: `service_role` nunca no frontend.
- RNF-04: Dados religiosos tratados como sensíveis (LGPD).
- RNF-05: Mobile-first, responsivo.
- RNF-06: Performance (carregamento rápido, offline).
- RNF-07: Acessibilidade WCAG AA.
- RNF-08: Testes (unit, integração, E2E, banco).
- RNF-09: Documentação e rastreabilidade.
