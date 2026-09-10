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
import {
  carregarEstadoRpg,
  salvarEstadoRpg,
} from "../../rpg/persistencia";

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

  const updateUser = useCallback((updater: (usuario: DemoUser) => DemoUser) => {
    setUser((atual) => {
      if (!atual) return atual;
      const proximo = updater(atual);
      salvarEstadoRpg({
        level: proximo.level,
        xp: proximo.xp,
        xpToNextLevel: proximo.xpToNextLevel,
        gold: proximo.gold,
        inventory: proximo.inventory,
        armor: proximo.armor,
        achievements: proximo.achievements,
        effects: proximo.effects,
      });
      return proximo;
    });
  }, []);

  const signUpWithPassword = useCallback(
    async (input: SignUpInput): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const acceptedAt = new Date().toISOString();
      const { error } = await supabaseClient.auth.signUp({
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
      return { ok: true };
    },
    [],
  );

  const signInWithPassword = useCallback(
    async ({ email, password }: SignInInput): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }
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
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { ok: false, message: translateAuthError(error) };
    }
    // Em caso de sucesso o navegador é redirecionado para o Google — não há
    // estado local adicional para atualizar aqui.
    return { ok: true };
  }, []);

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      if (!supabaseClient) {
        return { ok: false, message: authUnavailableMessage() };
      }
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + AUTH_ROUTE_PATHS.resetPassword,
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
