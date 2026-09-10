import { z } from "zod";

/**
 * Schemas de domínio (Zod) para a Apologética — FAQ de perguntas difíceis
 * de fé, por nível de dificuldade (pedido explícito do usuário: "sinto
 * falta de uma lista estilo perguntas frequentes por nível de dificuldade,
 * que responde e explica perguntas difíceis... como por que o mal existe e
 * afins"). Regras puras, sem dependência de React, navegador ou Supabase —
 * ver `IA/docs/architecture.md`.
 *
 * Conteúdo portado do app legado (`dev-pwa-biblia-game/public/game/assets/
 * js/dados/apologetica.js`), que já trazia 19 perguntas reais em 8
 * categorias, cada uma com resposta, versículos de apoio e pontos-chave.
 *
 * Referência bíblica citada (livro/capítulo/versículo) — nunca o texto do
 * versículo em si. O legado guardava o texto do versículo transcrito junto
 * de cada referência; esta versão cita apenas livro/capítulo/versículo,
 * igual ao já estabelecido em `study/schemas.ts` (regra 22 de
 * `IA/memory/rules.md`: não inventar versículos nem alterar o texto
 * bíblico; sem garantia de grafia exata da versão Almeida disponível
 * aqui, citamos apenas a referência).
 */
export const bibleReferenceSchema = z.object({
  /** Nome do livro por extenso, em português (ex.: "Romanos"). */
  book: z.string().min(1, "Informe o nome do livro."),
  chapter: z.number().int().positive(),
  verseStart: z.number().int().positive(),
  /** Presente apenas quando a referência cobre uma faixa/segundo versículo. */
  verseEnd: z.number().int().positive().optional(),
  /** Rótulo pronto para exibição (ex.: "Romanos 3:23-24"). */
  display: z.string().min(1, "Informe o rótulo de exibição."),
});

/** Três níveis, iguais ao legado — badges `iniciante`/`intermediario`/`avancado`. */
export const dificuldadeApologeticaSchema = z.enum([
  "iniciante",
  "intermediario",
  "avancado",
]);

export const categoriaApologeticaSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
});

export const perguntaApologeticaSchema = z.object({
  id: z.string().min(1),
  categoria: z.string().min(1),
  pergunta: z.string().min(1),
  resposta: z.string().min(1),
  /** Ao menos 1 referência bíblica que sustenta a resposta (regra 18). */
  referencias: z
    .array(bibleReferenceSchema)
    .min(1, "Toda pergunta precisa de ao menos 1 referência bíblica."),
  pontosChave: z
    .array(z.string().min(1))
    .min(1, "Toda pergunta precisa de ao menos 1 ponto-chave."),
  dificuldade: dificuldadeApologeticaSchema,
});

export type BibleReference = z.infer<typeof bibleReferenceSchema>;
export type DificuldadeApologetica = z.infer<
  typeof dificuldadeApologeticaSchema
>;
export type CategoriaApologetica = z.infer<typeof categoriaApologeticaSchema>;
export type PerguntaApologetica = z.infer<typeof perguntaApologeticaSchema>;
