# Privacidade — Consentimento, Exportação e Exclusão de Dados

Este documento é o contrato técnico de apoio à Política de Privacidade
(`src/pages/public/LegalPage.tsx`, `kind="privacy"`) e ao RF-06. Descreve,
em nível conceitual, como o consentimento é registrado e como a exportação
e a exclusão de dados devem ser implementadas — a implementação em si
(migration + RPC/edge function) é responsabilidade de uma task de backend
futura (hoje fora do escopo de T-016), mas o contrato abaixo já é vinculante
para quem for implementá-la.

## 1. Consentimento (RF-06)

- Modelo de dados: tabela `consentimentos`, detalhada em `IA/docs/database.md`.
- Versionamento dos documentos: `LEGAL_DOCUMENT_VERSIONS` em
  `src/pages/public/LegalPage.tsx` (uma versão — data ISO — por documento,
  `terms` e `privacy`, incrementada apenas em mudança material).
- Fluxo esperado (a implementar em T-005/T-006, onboarding):
  1. No passo de boas-vindas/termos do onboarding, o usuário vê um resumo
     e links para os documentos completos (`/termos`, `/privacidade`) e
     precisa marcar aceite explícito (não pode vir pré-marcado).
  2. Ao concluir o cadastro, o backend insere uma linha em `consentimentos`
     com `terms_version`/`privacy_version` iguais aos valores vigentes de
     `LEGAL_DOCUMENT_VERSIONS` no momento do aceite, `consent_source =
     "onboarding_signup"`, e timestamp (`created_at`, automático).
  3. Se o usuário logado tiver a versão mais recente de `consentimentos`
     desatualizada em relação a `LEGAL_DOCUMENT_VERSIONS` (ex.: os termos
     mudaram depois do cadastro dele), o app deve bloquear ações
     relevantes com um modal de reaceite (`consent_source =
     "reconsent_modal"`) antes de continuar.
  4. Revogação de consentimento (LGPD art. 8º, §5º): equivalente, na
     prática, a solicitar a exclusão da conta (seção 3) — o EvangeliGO não
     tem uso significativo sem o tratamento de dados religiosos/doutrinários
     consentido no cadastro.

## 2. Exportação de dados (JSON)

- **Gatilho**: ação explícita do usuário autenticado em
  Configurações → "Exportar meus dados" (UI ainda não implementada; este
  documento define o contrato que a UI e o backend devem seguir).
- **Mecanismo sugerido**: Supabase Edge Function ou RPC (`security definer`)
  autenticada, que roda no contexto do `user_id` da sessão (nunca recebe
  `user_id` por parâmetro do cliente, para não permitir exportar dados de
  outro usuário) e devolve um único arquivo JSON.
- **Conteúdo mínimo do export** (um objeto por tabela relevante, todas
  filtradas pelo `user_id` do solicitante):
  - `perfil`: dados de `profiles` (nome, sobrenome, nascimento, estado
    civil, avatar).
  - `progresso`: `user_progress`, `aula_progresso`, `quiz_resultados`.
  - `gamificacao`: `conquistas_usuario`, `inventario`, `armadura`,
    `missoes` (do usuário).
  - `engajamento_religioso`: marcações/anotações bíblicas, hinos
    favoritos, respostas de quiz doutrinário — sinalizado no JSON como
    dado sensível (`"categoria": "dado_sensivel_lgpd_art5_ii"`), para que
    o usuário identifique claramente essa categoria no arquivo recebido.
  - `social`: `amigos`, `mensagens` enviadas/recebidas pelo usuário,
    `missoes_colaborativas` das quais participa.
  - `consentimentos`: histórico completo de aceites (todas as linhas do
    usuário em `consentimentos`, não só a mais recente) — transparência
    sobre o que foi consentido e quando.
  - Dados **não** incluídos: senha (nunca é legível, nem pelo próprio
    backend — gerenciada pelo Supabase Auth); dados de terceiros (ex.:
    mensagens de outros usuários em um chat, além do conteúdo enviado pelo
    próprio solicitante).
- **Prazo**: entrega imediata (download direto), quando tecnicamente
  viável; caso o processamento seja assíncrono, notificar o usuário em até
  [15 dias corridos — mesmo prazo de resposta a direitos do titular
  descrito na Política de Privacidade, sujeito a confirmação jurídica].

## 3. Exclusão de conta

- **Gatilho**: ação explícita do usuário autenticado em Configurações →
  "Excluir minha conta", com confirmação adicional (ex.: reautenticação ou
  digitar o e-mail da conta) para evitar exclusão acidental.
- **Mecanismo sugerido**: Supabase Edge Function autenticada (não uma RPC
  direta do cliente, pois exclusão de `auth.users` exige `service_role`,
  que nunca roda no frontend — RNF-03/regra 11) que:
  1. Confirma a identidade do usuário autenticado (a partir do JWT da
     sessão, nunca de um `user_id` enviado pelo cliente).
  2. Anonimiza ou remove os dados pessoais e de engajamento
     religioso/doutrinário do usuário nas tabelas listadas na seção 2
     (`profiles`, progresso, gamificação, social) — exclusão física onde
     possível; anonimização (ex.: substituir texto de mensagens por
     `"[mensagem removida]"`, mantendo a linha por integridade referencial
     de conversas com terceiros) onde a remoção física quebraria dados de
     outro usuário (ex.: mensagens em uma conversa, participação em uma
     missão colaborativa de outro usuário).
  3. Mantém, pelo prazo de retenção definido na Política de Privacidade
     (atualmente [90 dias corridos — placeholder sujeito a confirmação
     jurídica], seção "Prazo de retenção dos dados"), apenas o mínimo
     necessário para obrigação legal/regulatória ou defesa em processo
     (ex.: registro de que a conta existiu e foi excluída, e o histórico
     de `consentimentos`, como prova de que o tratamento durante o uso do
     serviço foi consentido). Esses dados residuais **não** incluem
     conteúdo de engajamento religioso/doutrinário além do necessário para
     essa prova.
  4. Ao final do prazo de retenção, um processo (job agendado ou trigger)
     elimina definitivamente os dados residuais.
  5. Desativa o login (`auth.users`) imediatamente, mesmo antes do fim do
     prazo de retenção dos dados residuais — a conta para de ser acessível
     assim que a exclusão é solicitada e confirmada.
- **Modo demonstração**: não se aplica — dados do usuário demo nunca são
  persistidos (ver Termos de Uso, seção "Modo demonstração").

## 4. Princípios que qualquer implementação futura deve respeitar

- Minimização: exportar/excluir exatamente os dados do solicitante, nunca
  de terceiros.
- Nunca usar `service_role` no frontend (regra 11); toda exportação/
  exclusão roda em função de borda/RPC autenticada no backend.
- Não logar dados sensíveis durante o processo (regra 15) — logs de
  auditoria da operação registram que a ação ocorreu (`user_id`,
  timestamp, tipo de operação), nunca o conteúdo exportado/excluído.
- Qualquer prazo numérico citado aqui ([90 dias], [15 dias]) é um
  placeholder proposto por este agente jurídico, não uma definição final —
  ver observação de revisão jurídica formal em `LegalPage.tsx` e em
  `IA/memory/decisions.md`.
