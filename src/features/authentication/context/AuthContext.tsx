import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured } from "../../../config/environment";
import { supabaseClient } from "../../../infrastructure/supabase/client";
import {
  authUnavailableMessage,
  translateAuthError,
} from "../domain/authErrorMessages";
import { demoUser, type DemoUser } from "../demo/demoUser";
import { AUTH_ROUTE_PATHS } from "../routePaths";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { PRIVACY_VERSION, TERMS_VERSION } from "../domain/legalVersions";
import {
  carregarEstadoRpg,
  salvarEstadoRpg,
} from "../../rpg/persistencia";
import {
  carregarOuCriarEstadoReal,
  persistirEstadoRpgReal,
  type PerfilBasico,
} from "../../rpg/estadoReal";

/**
 * Retorna uma URL absoluta preservando o `base` do Vite. Em produção o
 * GitHub Pages hospeda o app em `/dev-evangeligo/`, não na raiz do domínio.
 */
function criarUrlDeRetorno(path: string): string {
  return new URL(
    path.replace(/^\//, ""),
    new URL(import.meta.env.BASE_URL, window.location.origin),
  ).toString();
}

/**
 * Grava o consentimento de Termos/Privacidade em `consentimentos`
 * (T-043/ADR-037 fecha um gap real: nenhum caminho de cadastro gravava
 * essa tabela antes, apesar de existir desde ADR-014/T-016). Idempotente
 * por (usuário, versão dos termos, versão da privacidade) — chamado tanto
 * no cadastro quanto no primeiro login real (contas com confirmação de
 * e-mail pendente não têm sessão ainda no momento do `signUp`, então RLS
 * bloqueia o insert ali; é registrado quando a sessão finalmente existe).
 * Nunca lança para quem chama — falha aqui não pode impedir o login.
 */
async function registrarConsentimento(
  userId: string,
  termosVersao: string,
  privacidadeVersao: string,
  origem: string,
): Promise<void> {
  if (!supabaseClient) return;
  try {
    const { data: existente } = await supabaseClient
      .from("consentimentos")
      .select("id")
      .eq("user_id", userId)
      .eq("terms_version", termosVersao)
      .eq("privacy_version", privacidadeVersao)
      .limit(1)
      .maybeSingle();
    if (existente) return;
    await supabaseClient.from("consentimentos").insert({
      user_id: userId,
      terms_version: termosVersao,
      privacy_version: privacidadeVersao,
      accepted_sensitive_data: true,
      consent_source: origem,
    });
  } catch {
    // Nunca bloquear login/cadastro por causa do registro de consentimento.
  }
}

export interface AuthActionResult {
  ok: boolean;
  /** Mensagem amigável (PT-BR) para exibir ao usuário quando `ok` é `false`. */
  message?: string;
}

export interface SignUpInput {
  nome: string;
  sobrenome: string;
  email: string;
  password: string;
  /** Versão vigente dos Termos de Uso no momento do consentimento. */
  termosVersao: string;
  /** Versão vigente da Política de Privacidade no momento do consentimento. */
  privacidadeVersao: string;
  /** Campos opcionais do onboarding (T-006, passos 3/6/7) — data ISO (YYYY-MM-DD). */
  nascimento?: string;
  estadoCivil?: string;
  objetivo?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Dados que faltam coletar de uma conta criada via Google OAuth (nome,
 * e-mail e senha já vêm do Google — não existe senha nessas contas) para
 * terminar o onboarding (T-043/ADR-037): retomado em `OnboardingPage`
 * depois do redirect de `/auth/retorno`.
 */
export interface CompletarCadastroGoogleInput {
  termosVersao: string;
  privacidadeVersao: string;
  nascimento?: string;
  estadoCivil?: string;
  objetivo?: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  // --- Modo de demonstração (comportamento existente, inalterado) ---
  user: DemoUser | null;
  isDemo: boolean;
  signInDemo: () => void;

  // --- Autenticação real via Supabase ---
  /** Sessão do Supabase Auth, ou `null` fora do modo demonstração/sem login. */
  session: Session | null;
  /** Usuário do Supabase Auth (`session.user`), atalho de conveniência. */
  supabaseUser: User | null;
  /** Estado de carregamento da sessão inicial (evita "piscar" telas protegidas). */
  authStatus: AuthStatus;
  /** Se o projeto tem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configurados. */
  isSupabaseConfigured: boolean;
  /** `true` em modo demonstração OU com sessão Supabase válida. */
  isAuthenticated: boolean;

  signUpWithPassword: (input: SignUpInput) => Promise<AuthActionResult>;
  signInWithPassword: (input: SignInInput) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  /** Termina o cadastro de uma conta criada via Google (T-043/ADR-037) — grava perfil + consentimento, marca `onboarding_completo`. */
  completarCadastroGoogle: (
    input: CompletarCadastroGoogleInput,
  ) => Promise<AuthActionResult>;
  sendPasswordResetEmail: (email: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;

  /** Encerra a sessão de demonstração e/ou a sessão real do Supabase. */
  signOut: () => Promise<void>;

  /**
   * Aplica uma mutação ao `DemoUser` atual e persiste a fatia de RPG
   * (loja/armadura/inventário/conquistas/nível/ouro) em `localStorage` —
   * ver `src/features/rpg/persistencia.ts`. Único ponto de escrita real
   * no estado do usuário demo hoje (antes do T-010, `user` nunca mudava
   * depois do login).
   */
  updateUser: (updater: (usuario: DemoUser) => DemoUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    supabaseClient ? "loading" : "unauthenticated",
  );

  useEffect(() => {
    if (!supabaseClient) {
      return;
    }
    let active = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setAuthStatus(newSession ? "authenticated" : "unauthenticated");
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInDemo = useCallback(() => {
    const salvo = carregarEstadoRpg();
    setUser(salvo ? { ...demoUser, ...salvo } : demoUser);
  }, []);

  /**
   * Carrega o estado de RPG REAL de uma conta autenticada (T-047/ADR-040) —
   * ponte que faltava entre `authStatus === "authenticated"` e `user`, que
   * antes só era populado pelo modo demonstração. Não roda se já houver um
   * `user` demo ativo (nunca pisa na demonstração) nem se o `user` real já
   * carregado for o mesmo da sessão atual (evita refetch a cada re-render).
   */
  useEffect(() => {
    if (!supabaseClient) return;
    if (authStatus !== "authenticated" || !session?.user) return;
    if (user && (user.isDemo || user.id === session.user.id)) return;
    const supaUser = session.user;
    let ativo = true;
    Promise.resolve(
      supabaseClient
        .from("profiles")
        .select("nome, sobrenome, avatar_config")
        .eq("id", supaUser.id)
        .maybeSingle(),
    )
      .then(({ data }) => (data as PerfilBasico | null))
      .catch(() => null)
      .then((perfil) => carregarOuCriarEstadoReal(supaUser, perfil))
      .then((real) => {
        if (ativo) setUser(real);
      });
    return () => {
      ativo = false;
    };
  }, [authStatus, session, user]);

  const updateUser = useCallback(
    (updater: (usuario: DemoUser) => DemoUser) => {
      // Lê `user` direto (não a forma funcional `setUser(prev => ...)`) de
      // propósito: a função passada a `setUser` PRECISA ser pura (contrato
      // do React — o `StrictMode` a chama 2x em desenvolvimento pra pegar
      // exatamente efeitos colaterais como este). `salvarEstadoRpg`
      // (localStorage) é idempotente, então rodar 2x nunca doeu;
      // `persistirEstadoRpgReal` (DELETE+INSERT no Supabase) NÃO é — rodar
      // 2x concorrente causava "duplicate key value" real (achado ao
      // testar T-047 contra o banco de verdade). Só chamadores síncronos
      // de UI usam `updateUser`, então `user` já está atualizado aqui.
      if (!user) return;
      const proximo = updater(user);
      setUser(proximo);
      if (proximo.isDemo) {
        salvarEstadoRpg({
          level: proximo.level,
          xp: proximo.xp,
          xpToNextLevel: proximo.xpToNextLevel,
          gold: proximo.gold,
          inventory: proximo.inventory,
          armor: proximo.armor,
          achievements: proximo.achievements,
          effects: proximo.effects,
          avatarConfig: proximo.avatarConfig,
        });
      } else {
        void persistirEstadoRpgReal(proximo.id, user, proximo);
      }
    },
    [user],
  );

  const signUpWithPassword = useCallback(
    async (input: SignUpInput): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const acceptedAt = new Date().toISOString();
      const { data, error } = await supabaseClient.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            nome: input.nome,
            sobrenome: input.sobrenome,
            nascimento: input.nascimento ?? "",
            estado_civil: input.estadoCivil ?? "",
            objetivo: input.objetivo ?? "",
            termos_versao: input.termosVersao,
            termos_aceitos_em: acceptedAt,
            privacidade_versao: input.privacidadeVersao,
            privacidade_aceita_em: acceptedAt,
          },
        },
      });
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
      // Se o Supabase exige confirmação de e-mail, `data.session` vem nulo
      // aqui — sem sessão, RLS bloqueia o insert em `consentimentos`
      // (`consentimentos_insert_own` exige `auth.uid() = user_id`). Nesse
      // caso o consentimento é registrado depois, no primeiro login real
      // (ver `signInWithPassword`), não aqui.
      if (data.session) {
        await registrarConsentimento(
          data.session.user.id,
          input.termosVersao,
          input.privacidadeVersao,
          "onboarding_email",
        );
        await supabaseClient
          .from("profiles")
          .update({ onboarding_completo: true })
          .eq("id", data.session.user.id);
      }
      return { ok: true };
    },
    [],
  );

  const signInWithPassword = useCallback(
    async ({ email, password }: SignInInput): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
      // Cobre o caso de `signUpWithPassword` não ter conseguido gravar o
      // consentimento (confirmação de e-mail pendente na hora do cadastro —
      // sem sessão ainda, RLS bloqueava o insert). Idempotente, então
      // rodar em todo login não gera duplicata nem custo real depois da
      // primeira vez (regra 30 — corrigindo o gap encontrado, não só no
      // caminho novo do Google).
      const metadata = data.user.user_metadata as {
        termos_versao?: string;
        privacidade_versao?: string;
      };
      void registrarConsentimento(
        data.user.id,
        metadata.termos_versao || TERMS_VERSION,
        metadata.privacidade_versao || PRIVACY_VERSION,
        "onboarding_email",
      );
      return { ok: true };
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    if (!supabaseClient) {
      return { ok: false, message: authUnavailableMessage() };
    }
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: criarUrlDeRetorno(ROUTE_PATHS.authCallback),
      },
    });
    if (error) {
      return { ok: false, message: translateAuthError(error) };
    }
    // Em caso de sucesso o navegador é redirecionado para o Google, e depois
    // para `ROUTE_PATHS.authCallback` (`AuthCallbackPage`) — não há estado
    // local adicional para atualizar aqui.
    return { ok: true };
  }, []);

  const completarCadastroGoogle = useCallback(
    async (
      input: CompletarCadastroGoogleInput,
    ): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const usuario = sessionData.session?.user;
      if (!usuario) {
        return {
          ok: false,
          message: "Sessão não encontrada. Tente entrar com o Google novamente.",
        };
      }
      const { error } = await supabaseClient
        .from("profiles")
        .update({
          nascimento: input.nascimento || null,
          estado_civil: input.estadoCivil || null,
          objetivo: input.objetivo || null,
          onboarding_completo: true,
        })
        .eq("id", usuario.id);
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
      await registrarConsentimento(
        usuario.id,
        input.termosVersao,
        input.privacidadeVersao,
        "onboarding_google",
      );
      return { ok: true };
    },
    [],
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: criarUrlDeRetorno(AUTH_ROUTE_PATHS.resetPassword),
      });
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
      return { ok: true };
    },
    [],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    setUser(null);
    if (supabaseClient && session) {
      await supabaseClient.auth.signOut();
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isDemo: user?.isDemo ?? false,
      signInDemo,
      session,
      supabaseUser: session?.user ?? null,
      authStatus,
      isSupabaseConfigured,
      isAuthenticated:
        (user?.isDemo ?? false) || authStatus === "authenticated",
      signUpWithPassword,
      signInWithPassword,
      signInWithGoogle,
      completarCadastroGoogle,
      sendPasswordResetEmail,
      updatePassword,
      signOut,
      updateUser,
    }),
    [
      user,
      signInDemo,
      session,
      authStatus,
      signUpWithPassword,
      signInWithPassword,
      signInWithGoogle,
      completarCadastroGoogle,
      sendPasswordResetEmail,
      updatePassword,
      signOut,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return context;
}
