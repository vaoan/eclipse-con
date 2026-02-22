import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        lazy: () => import("@/features/convention/presentation/ConventionPage"),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
