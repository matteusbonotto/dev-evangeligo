import { z } from "zod";
import type { AvatarConfig } from "../../avatar/types";
import { CONFIG_AVATAR_PADRAO } from "../../avatar/avatarUrl";
import { emailSchema, nameFieldSchema, passwordSchema } from "./authSchemas";

/**
 * Onboarding estilo Duolingo (T-006, 10 passos desde T-077b —
 * `IA/docs/ux-ui.md`, "Onboarding"): boas-vindas/termos, nome,
 * nascimento, e-mail, senha, estado civil, objetivo, Libras,
 * notificações, avatar. Migrado do app legado (`dev-pwa-biblia-game`,
 * `passoCadastro`/`avancarCadastro()`/`finalizarCadastro()` em `app.js`) —
 * mesma ordem de passos e mesma arquitetura de "tudo em memória, uma
 * única chamada de cadastro no final" (evita depender de sessão
 * autenticada nos passos intermediários, já que o Supabase pode exigir
 * confirmação de e-mail antes de liberar sessão). Os passos 8/9 (Libras/
 * notificações) não têm equivalente no legado — pedido novo do usuário
 * depois de já existirem como preferências avulsas (T-073) nunca
 * perguntadas no cadastro. O 10º passo (avatar) foi inicialmente pensado
 * como um destaque do tour em vez de passo do assistente (pra não
 * estender a metadata do signup) — voltou a ser um passo de verdade a
 * pedido explícito do usuário; usa o MESMO mecanismo já provado de
 * nascimento/estado_civil/objetivo (metadata do `auth.signUp` → trigger
 * `handle_new_user`), sem duplicar lógica nova de persistência.
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

/**
 * Libras (VLibras) e notificações push (T-077) — pedido explícito do
 * usuário: o onboarding nunca perguntava sobre nenhum dos dois, mesmo os
 * 2 já existindo como preferência (`shared/preferencias.ts`, T-073).
 * Ambos são OPCIONAIS/puláveis de propósito — nunca travam o cadastro, e
 * não dependem de sessão/`profiles` (só `localStorage`/permissão do
 * navegador), então funcionam igual nos fluxos por e-mail e por Google.
 */
export const passoLibrasSchema = z.object({
  usaLibras: z.enum(["sim", "nao", ""]),
});

export const passoNotificacoesSchema = z.object({
  quisNotificacoes: z.enum(["sim", "nao", ""]),
});

/**
 * Avatar (T-077b) — sempre válido, nunca trava o cadastro: quem não mexer
 * em nada segue com `CONFIG_AVATAR_PADRAO` (o mesmo padrão de contas já
 * existentes) e pode personalizar de novo a qualquer momento em `/avatar`.
 */
export const passoAvatarSchema = z.object({});

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
  usaLibras: "sim" | "nao" | "";
  quisNotificacoes: "sim" | "nao" | "";
  avatarConfig: AvatarConfig;
}

export const VALORES_AVATAR_INICIAIS: AvatarConfig = CONFIG_AVATAR_PADRAO;

export const ONBOARDING_STEP_SCHEMAS = [
  passoBoasVindasSchema,
  passoNomeSchema,
  passoNascimentoSchema,
  passoEmailSchema,
  passoSenhaSchema,
  passoEstadoCivilSchema,
  passoObjetivoSchema,
  passoLibrasSchema,
  passoNotificacoesSchema,
  passoAvatarSchema,
] as const;

export const ONBOARDING_TOTAL_PASSOS = ONBOARDING_STEP_SCHEMAS.length;
