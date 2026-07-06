import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";

/** Root application component. Wraps the router with all global providers. */
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
