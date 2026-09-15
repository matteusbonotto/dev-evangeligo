import { AppRouter } from "./app/AppRouter";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
