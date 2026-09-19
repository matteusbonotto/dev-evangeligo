import { z } from "zod";

/**
 * Schemas de domínio (Zod) para o Feed de Devocionais (T-013 — "Publicar
 * reflexões com versículos"). Regras puras, sem dependência de React,
 * navegador ou Supabase — ver `IA/docs/architecture.md`.
 *
 * Mesma convenção já usada em `apologetics/schemas.ts`/`study/quiz/schemas.ts`:
 * referência bíblica citada apenas como livro/capítulo/versículo (nunca o
 * texto transcrito aqui) — o texto real, quando exibido, vem ao vivo de
 * `bible/dataLoader.ts` (já migrado da versão Almeida licenciada), evitando
 * uma terceira cópia do texto bíblico espalhada pelo conteúdo do app
 * (regra 22 de `IA/memory/rules.md`).
 */
export const devocionalReferenciaSchema = z.object({
  livroOrder: z.number().int().positive(),
  capitulo: z.number().int().positive(),
  versiculo: z.number().int().positive(),
  /** Rótulo pronto pra exibição (ex.: "João 3:16"). */
  display: z.string().min(1),
});

export const devocionalEntrySchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  tema: z.string().min(1),
  referencia: devocionalReferenciaSchema,
  /** Reflexão curta (2-4 parágrafos), com base bíblica explícita (regra 18). */
  reflexao: z.array(z.string().min(1)).min(1),
  /** Aplicação prática de 1 frase — nunca linguagem de mérito espiritual (regra 20). */
  aplicacao: z.string().min(1),
});

export type DevocionalReferencia = z.infer<typeof devocionalReferenciaSchema>;
export type DevocionalEntry = z.infer<typeof devocionalEntrySchema>;
