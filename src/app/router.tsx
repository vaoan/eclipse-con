import { createHashRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";

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

export function AppRouter() {
  return <RouterProvider router={router} />;
}
