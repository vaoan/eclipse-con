import { createHashRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";

/** Hash-based React Router router rendering the `MainLayout` wrapper around all feature routes. */
const router = createHashRouter([
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
