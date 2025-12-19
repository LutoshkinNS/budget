import { createFileRoute, redirect } from "@tanstack/react-router";

import { authMe } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { Login } from "@/pages/login";

export const Route = createFileRoute("/_public/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    try {
      await authMe();
      throw redirect({ to: "/" });
    } catch (error) {
      if (error && typeof error === "object" && "href" in error) {
        throw error;
      }
    }
  },
});

function RouteComponent() {
  return <Login />;
}
