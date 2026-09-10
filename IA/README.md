# IA — Núcleo Operacional de Conhecimento

Este diretório é o **núcleo operacional de conhecimento** do projeto **EvangeliGO** (app gamificado estilo Duolingo de Teologia Cristã Reformada Calvinista).

Aqui os agentes de IA encontram tudo o que precisam para continuar trabalhando sem depender do histórico da conversa: requisitos, regras, decisões, arquitetura, bugs, correções, padrões, comandos, testes e o checklist operacional.

## Como navegar

| Pasta | Conteúdo |
|-------|----------|
| `agents/` | Agentes especialistas (teologia, jurídico, privacidade, gamificação, RPG, game design, etc.) |
| `memory/` | Memória global persistente (requisitos, regras, decisões, bugs, changelog) |
| `docs/` | Documentação técnica (requirements, architecture, database, api, ux-ui, security, testing) |
| `standards/` | Padrões de código, nomes, arquitetura, segurança, git |
| `commands/` | Comandos reais do projeto (install, dev, test, build, deploy) |
| `checklist/` | Kanban operacional (`index.html`) + estado persistente (`tasks.json`) |
| `discussions/` | Discussões entre agentes sobre decisões relevantes |

## Regra de continuidade

Antes de trabalhar em uma nova sessão, consultar:

1. `IA/README.md`
2. `IA/memory/project-memory.md`
3. `IA/memory/user-requirements.md`
4. `IA/memory/rules.md`
5. `IA/memory/decisions.md`
6. `IA/checklist/tasks.json`
7. `IA/docs/`
8. `IA/agents/`

Selecionar apenas os agentes relevantes para a tarefa.

## Princípio final

O objetivo não é apenas fazer o software funcionar, mas construir software **funcionando, bem arquitetado, testado, documentado, rastreável e capaz de continuar evoluindo** com uma equipe de agentes de IA.
