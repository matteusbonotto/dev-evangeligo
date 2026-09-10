import { z } from "zod";
import { emailSchema, nameFieldSchema, passwordSchema } from "./authSchemas";

/**
 * Onboarding estilo Duolingo (T-006, 7 passos — `IA/docs/ux-ui.md`,
 * "Onboarding"): boas-vindas/termos, nome, nascimento, e-mail, senha,
 * estado civil, objetivo. Migrado do app legado (`dev-pwa-biblia-game`,
 * `passoCadastro`/`avancarCadastro()`/`finalizarCadastro()` em `app.js`) —
 * mesma ordem de passos e mesma arquitetura de "tudo em memória, uma
 * única chamada de cadastro no final" (evita depender de sessão
 * autenticada nos passos intermediários, já que o Supabase pode exigir
 * confirmação de e-mail antes de liberar sessão). Único desvio
 * deliberado do legado: o 7º passo é "objetivo" (sem equivalente no
 * legado, que usava esse passo para criação de avatar — aqui a criação
 * de avatar já existe como feature própria, `/avatar`, acessível a
 * qualquer momento, T-033) — ver ADR correspondente em
 * `IA/memory/decisions.md`.
 */

const NAME_MAX_LENGTH = 80;

export const ESTADOS_CIVIS = [
  { valor: "solteiro", label: "Solteiro(a)" },
  { valor: "casado", label: "Casado(a)" },
  { valor: "uniao_estavel", label: "União estável" },
  { valor: "divorciado", label: "Divorciado(a)" },
  { valor: "viuvo", label: "Viúvo(a)" },
  { valor: "outro", label: "Outro" },
] as const;
export type EstadoCivil = (typeof ESTADOS_CIVIS)[number]["valor"];
const ESTADO_CIVIL_VALORES: readonly string[] = ESTADOS_CIVIS.map((e) => e.valor);

/**
 * Sem equivalente no app legado — motivos de estudo pensados para este
 * produto (teologia reformada), não uma tradução literal de nada.
 */
export const OBJETIVOS = [
  { valor: "conhecer_biblia", label: "Conhecer melhor a Bíblia" },
  { valor: "habito_diario", label: "Criar o hábito de estudar todo dia" },
  { valor: "teologia_reformada", label: "Aprofundar em teologia reformada" },
  { valor: "discipulado", label: "Preparar-me para discipular outros" },
  { valor: "familia", label: "Estudar em família" },
  { valor: "outro", label: "Outro motivo" },
] as const;
export type Objetivo = (typeof OBJETIVOS)[number]["valor"];
const OBJETIVO_VALORES: readonly string[] = OBJETIVOS.map((o) => o.valor);

function ehDataValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(data.getTime());
}

/** Nascimento é OPCIONAL (`IA/docs/ux-ui.md`) — "" passa, só valida quando preenchido. */
export const nascimentoSchema = z
  .string()
  .trim()
  .refine((valor) => valor === "" || ehDataValida(valor), {
    message: "Informe uma data válida.",
  })
  .refine(
    (valor) => valor === "" || new Date(`${valor}T00:00:00`) <= new Date(),
    { message: "A data de nascimento não pode ser no futuro." },
  )
  .refine(
    (valor) => valor === "" || new Date(`${valor}T00:00:00`) >= new Date("1900-01-01"),
    { message: "Informe uma data de nascimento válida." },
  );

/** Estado civil é OPCIONAL (`IA/docs/ux-ui.md`) — "" passa. */
export const estadoCivilSchema = z
  .string()
  .refine((valor) => valor === "" || ESTADO_CIVIL_VALORES.includes(valor), {
    message: "Escolha uma opção válida.",
  });

/** Objetivo é OBRIGATÓRIO (único passo sem "(opcional)" em `IA/docs/ux-ui.md`). */
export const objetivoSchema = z
  .string()
  .refine((valor) => OBJETIVO_VALORES.includes(valor), {
    message: "Escolha um objetivo para continuar.",
  });

export const passoBoasVindasSchema = z.object({
  aceitaTermos: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar os Termos de Uso.",
  }),
  aceitaPrivacidade: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar a Política de Privacidade.",
  }),
});

export const passoNomeSchema = z.object({
  nome: nameFieldSchema,
  sobrenome: z
    .string()
    .trim()
    .max(NAME_MAX_LENGTH, "Sobrenome muito longo.")
    .optional()
    .or(z.literal("")),
});

export const passoNascimentoSchema = z.object({
  nascimento: nascimentoSchema,
});

export const passoEmailSchema = z.object({
  email: emailSchema,
});

export const passoSenhaSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const passoEstadoCivilSchema = z.object({
  estadoCivil: estadoCivilSchema,
});

export const passoObjetivoSchema = z.object({
  objetivo: objetivoSchema,
});

export interface OnboardingFormValues {
  aceitaTermos: boolean;
  aceitaPrivacidade: boolean;
  nome: string;
  sobrenome: string;
  nascimento: string;
  email: string;
  password: string;
  confirmPassword: string;
  estadoCivil: string;
  objetivo: string;
}

export const ONBOARDING_STEP_SCHEMAS = [
  passoBoasVindasSchema,
  passoNomeSchema,
  passoNascimentoSchema,
  passoEmailSchema,
  passoSenhaSchema,
  passoEstadoCivilSchema,
  passoObjetivoSchema,
] as const;

export const ONBOARDING_TOTAL_PASSOS = ONBOARDING_STEP_SCHEMAS.length;
