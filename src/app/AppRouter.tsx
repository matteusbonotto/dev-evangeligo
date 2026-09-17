import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";

const HomePage = lazy(() =>
  import("../pages/public/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);
const LegalPage = lazy(() =>
  import("../pages/public/LegalPage").then((module) => ({
    default: module.LegalPage,
  })),
);
const SignInPage = lazy(() =>
  import("../features/authentication/pages/SignInPage").then((module) => ({
    default: module.SignInPage,
  })),
);
const OnboardingPage = lazy(() =>
  import("../features/authentication/pages/OnboardingPage").then((module) => ({
    default: module.OnboardingPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../features/authentication/pages/ForgotPasswordPage").then(
    (module) => ({ default: module.ForgotPasswordPage }),
  ),
);
const ResetPasswordPage = lazy(() =>
  import("../features/authentication/pages/ResetPasswordPage").then(
    (module) => ({ default: module.ResetPasswordPage }),
  ),
);
const AuthCallbackPage = lazy(() =>
  import("../features/authentication/pages/AuthCallbackPage").then(
    (module) => ({ default: module.AuthCallbackPage }),
  ),
);
const DashboardPage = lazy(() =>
  import("../features/dashboard/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const TrilhasPage = lazy(() =>
  import("../features/study/pages/TrilhasPage").then((module) => ({
    default: module.TrilhasPage,
  })),
);
const AulaPage = lazy(() =>
  import("../features/study/pages/AulaPage").then((module) => ({
    default: module.AulaPage,
  })),
);
const QuizPage = lazy(() =>
  import("../features/study/pages/QuizPage").then((module) => ({
    default: module.QuizPage,
  })),
);
const LivrosPage = lazy(() =>
  import("../features/bible/pages/LivrosPage").then((module) => ({
    default: module.LivrosPage,
  })),
);
const CapitulosPage = lazy(() =>
  import("../features/bible/pages/CapitulosPage").then((module) => ({
    default: module.CapitulosPage,
  })),
);
const LeituraPage = lazy(() =>
  import("../features/bible/pages/LeituraPage").then((module) => ({
    default: module.LeituraPage,
  })),
);
const HinosPage = lazy(() =>
  import("../features/harpa/pages/HinosPage").then((module) => ({
    default: module.HinosPage,
  })),
);
const HinoPage = lazy(() =>
  import("../features/harpa/pages/HinoPage").then((module) => ({
    default: module.HinoPage,
  })),
);
const AvatarEditorPage = lazy(() =>
  import("../features/avatar/pages/AvatarEditorPage").then((module) => ({
    default: module.AvatarEditorPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../features/authentication/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const VidaInteriorHistoricoPage = lazy(() =>
  import("../features/dashboard/pages/VidaInteriorHistoricoPage").then(
    (module) => ({
      default: module.VidaInteriorHistoricoPage,
    }),
  ),
);
const FaqPage = lazy(() =>
  import("../features/faq/pages/FaqPage").then((module) => ({
    default: module.FaqPage,
  })),
);
const LojaPage = lazy(() =>
  import("../features/rpg/pages/LojaPage").then((module) => ({
    default: module.LojaPage,
  })),
);
const InventarioPage = lazy(() =>
  import("../features/rpg/pages/InventarioPage").then((module) => ({
    default: module.InventarioPage,
  })),
);
const ExerciciosPage = lazy(() =>
  import("../features/study/pages/ExerciciosPage").then((module) => ({
    default: module.ExerciciosPage,
  })),
);
const WordSearchListPage = lazy(() =>
  import("../features/study/wordsearch/pages/WordSearchListPage").then(
    (module) => ({ default: module.WordSearchListPage }),
  ),
);
const WordSearchPlayPage = lazy(() =>
  import("../features/study/wordsearch/pages/WordSearchPlayPage").then(
    (module) => ({ default: module.WordSearchPlayPage }),
  ),
);
const TermoListPage = lazy(() =>
  import("../features/study/termo/pages/TermoListPage").then((module) => ({
    default: module.TermoListPage,
  })),
);
const TermoPlayPage = lazy(() =>
  import("../features/study/termo/pages/TermoPlayPage").then((module) => ({
    default: module.TermoPlayPage,
  })),
);
const QuebraCabecaListPage = lazy(() =>
  import("../features/study/quebracabeca/pages/QuebraCabecaListPage").then(
    (module) => ({ default: module.QuebraCabecaListPage }),
  ),
);
const QuebraCabecaPlayPage = lazy(() =>
  import("../features/study/quebracabeca/pages/QuebraCabecaPlayPage").then(
    (module) => ({ default: module.QuebraCabecaPlayPage }),
  ),
);
const ApologeticaPage = lazy(() =>
  import("../features/apologetics/pages/ApologeticaPage").then((module) => ({
    default: module.ApologeticaPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<main className="loading-screen">Carregando...</main>}>
      <Routes>
        <Route path={ROUTE_PATHS.home} element={<HomePage />} />
        <Route path={ROUTE_PATHS.presentation} element={<HomePage />} />
        <Route path={ROUTE_PATHS.signIn} element={<SignInPage />} />
        <Route path={ROUTE_PATHS.signUp} element={<OnboardingPage />} />
        <Route
          path={ROUTE_PATHS.forgotPassword}
          element={<ForgotPasswordPage />}
        />
        <Route
          path={ROUTE_PATHS.resetPassword}
          element={<ResetPasswordPage />}
        />
        <Route
          path={ROUTE_PATHS.authCallback}
          element={<AuthCallbackPage />}
        />
        <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
        <Route path={ROUTE_PATHS.trilhas} element={<TrilhasPage />} />
        <Route path={ROUTE_PATHS.aula} element={<AulaPage />} />
        <Route path={ROUTE_PATHS.quiz} element={<QuizPage />} />
        <Route path={ROUTE_PATHS.bible} element={<LivrosPage />} />
        <Route path={ROUTE_PATHS.bibleCapitulos} element={<CapitulosPage />} />
        <Route path={ROUTE_PATHS.bibleLeitura} element={<LeituraPage />} />
        <Route path={ROUTE_PATHS.harpa} element={<HinosPage />} />
        <Route path={ROUTE_PATHS.harpaHino} element={<HinoPage />} />
        <Route path={ROUTE_PATHS.avatar} element={<AvatarEditorPage />} />
        <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
        <Route
          path={ROUTE_PATHS.vidaInteriorHistorico}
          element={<VidaInteriorHistoricoPage />}
        />
        <Route path={ROUTE_PATHS.faq} element={<FaqPage />} />
        <Route path={ROUTE_PATHS.loja} element={<LojaPage />} />
        <Route path={ROUTE_PATHS.inventario} element={<InventarioPage />} />
        <Route path={ROUTE_PATHS.exercicios} element={<ExerciciosPage />} />
        <Route
          path={ROUTE_PATHS.cacaPalavras}
          element={<WordSearchListPage />}
        />
        <Route
          path={ROUTE_PATHS.cacaPalavrasJogar}
          element={<WordSearchPlayPage />}
        />
        <Route path={ROUTE_PATHS.termo} element={<TermoListPage />} />
        <Route path={ROUTE_PATHS.termoJogar} element={<TermoPlayPage />} />
        <Route
          path={ROUTE_PATHS.quebraCabeca}
          element={<QuebraCabecaListPage />}
        />
        <Route
          path={ROUTE_PATHS.quebraCabecaJogar}
          element={<QuebraCabecaPlayPage />}
        />
        <Route
          path={ROUTE_PATHS.apologetica}
          element={<ApologeticaPage />}
        />
        <Route path={ROUTE_PATHS.terms} element={<LegalPage kind="terms" />} />
        <Route
          path={ROUTE_PATHS.privacy}
          element={<LegalPage kind="privacy" />}
        />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
      </Routes>
    </Suspense>
  );
}
