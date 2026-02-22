import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        lazy: () => import("@/features/home/presentation/HomePage"),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
