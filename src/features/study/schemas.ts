import { z } from "zod";

/**
 * Schemas de domínio (Zod) para trilhas e aulas de estudo (RF-07/RF-08).
 * Regras puras, sem dependência de React, navegador ou Supabase — ver
 * `IA/docs/architecture.md`. O formato espelha as tabelas planejadas
 * `trilhas`/`aulas` de `IA/docs/database.md`, para que uma futura migração
 * para Supabase troque apenas a fonte dos dados, não o formato.
 *
 * Estes schemas são a fonte da verdade dos tipos (`Aula`, `Trilha`,
 * `BibleReference` são inferidos deles em `types.ts`) e também a validação
 * de runtime usada nos testes de conteúdo (`content/index.test.ts`).
 */

/**
 * Referência bíblica citada (livro/capítulo/versículo) — nunca o texto do
 * versículo em si. Regra 22 de `IA/memory/rules.md`: não inventar
 * versículos nem alterar o texto bíblico; como não há garantia de grafia
 * exata da versão Almeida disponível aqui, o conteúdo desta feature cita
 * apenas a referência, nunca transcreve o texto do versículo.
 */
export const bibleReferenceSchema = z.object({
  /** Nome do livro por extenso, em português (ex.: "Romanos"). */
  book: z.string().min(1, "Informe o nome do livro."),
  chapter: z.number().int().positive(),
  verseStart: z.number().int().positive(),
  /** Presente apenas quando a referência cobre uma faixa de versículos. */
  verseEnd: z.number().int().positive().optional(),
  /** Rótulo pronto para exibição (ex.: "Romanos 3:23-24"). */
  display: z.string().min(1, "Informe o rótulo de exibição."),
});

export const aulaSchema = z.object({
  id: z.string().min(1),
  trilhaId: z.string().min(1),
  /** Posição da aula dentro da trilha, a partir de 1. */
  order: z.number().int().positive(),
  title: z.string().min(1),
  /**
   * Resumo doutrinário de ensino. Conteúdo de introdução — não substitui
   * estudo aprofundado nem dispensa revisão teológica formal (regra 18,
   * ADR-004).
   */
  summary: z.string().min(1),
  /** 2 a 4 referências bíblicas explícitas que sustentam o ensino (regra 18). */
  bibleReferences: z
    .array(bibleReferenceSchema)
    .min(2, "Toda aula precisa de ao menos 2 referências bíblicas.")
    .max(4, "Toda aula deve ter no máximo 4 referências bíblicas."),
  /** Duração estimada de leitura/estudo, em minutos (apenas informativo para a UI). */
  estimatedMinutes: z.number().int().positive(),
  /**
   * Identificador do quiz associado a esta aula. Ainda não populado: o
   * motor de quiz é construído em T-008. O campo já existe aqui para o
   * T-008 anexar sem precisar alterar este schema/tipo.
   */
  quizId: z.string().min(1).optional(),
});

export const trilhaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  /** Posição de exibição da trilha, a partir de 1. */
  order: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  /** Referência bíblica-âncora que resume o tema da trilha. */
  verseFocus: bibleReferenceSchema.optional(),
});

export type BibleReference = z.infer<typeof bibleReferenceSchema>;
export type Aula = z.infer<typeof aulaSchema>;
export type Trilha = z.infer<typeof trilhaSchema>;
