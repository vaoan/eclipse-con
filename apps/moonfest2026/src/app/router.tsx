import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";

/** Browser-history React Router router rendering the `MainLayout` wrapper around all feature routes. */
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        lazy: () => import("@/features/convention/presentation/ConventionPage"),
      },
      {
        path: "/registration-tutorial",
        lazy: () =>
          import("@/features/registration-tutorial/presentation/RegistrationTutorialPage"),
      },
    ],
  },
]);

/** Renders the configured `RouterProvider`, connecting the hash router to the React tree. */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
