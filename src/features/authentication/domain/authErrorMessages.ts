/**
 * Traduz erros de autenticação (Supabase Auth ou falha de rede) para
 * mensagens amigáveis em português, sem nunca repassar/logar o objeto de
 * erro original — que pode conter detalhes internos (regra 15: não logar
 * dados sensíveis).
 *
 * Função pura: recebe `unknown` (o formato de erro do Supabase muda entre
 * versões) e devolve sempre uma string segura para exibir ao usuário.
 */

const DEFAULT_MESSAGE =
  "Não foi possível concluir a operação. Tente novamente.";

const AUTH_UNAVAILABLE_MESSAGE =
  "Autenticação por e-mail indisponível nesta instalação. Use o modo de demonstração.";

interface KnownError {
  match: (normalized: string) => boolean;
  message: string;
}

const KNOWN_ERRORS: KnownError[] = [
  {
    match: (m) => m.includes("invalid login credentials"),
    message: "E-mail ou senha incorretos.",
  },
  {
    match: (m) =>
      m.includes("already registered") || m.includes("already exists"),
    message: "Já existe uma conta com este e-mail.",
  },
  {
    match: (m) => m.includes("email not confirmed"),
    message:
      "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).",
  },
  {
    match: (m) => m.includes("password") && m.includes("least"),
    message: "A senha não atende aos requisitos mínimos de segurança.",
  },
  {
    match: (m) => m.includes("rate limit") || m.includes("too many requests"),
    message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  },
  {
    match: (m) => m.includes("network") || m.includes("fetch"),
    message: "Falha de conexão. Verifique sua internet e tente novamente.",
  },
  {
    match: (m) => m.includes("user not found"),
    // Mensagem intencionalmente genérica: não confirmar/negar existência de
    // conta por e-mail evita enumeração de usuários.
    message:
      "Se este e-mail estiver cadastrado, você receberá as instruções em instantes.",
  },
];

export function translateAuthError(error: unknown): string {
  const rawMessage = extractMessage(error);
  const normalized = rawMessage.toLowerCase();

  const known = KNOWN_ERRORS.find((entry) => entry.match(normalized));
  return known ? known.message : DEFAULT_MESSAGE;
}

export function authUnavailableMessage(): string {
  return AUTH_UNAVAILABLE_MESSAGE;
}

function extractMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "";
}
