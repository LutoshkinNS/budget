import { createFileRoute, redirect } from "@tanstack/react-router";

import { authMe } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { Main } from "@/pages/main";

export const Route = createFileRoute("/_private/")({
  component: Main,
  beforeLoad: async () => {
    try {
      await authMe();
    } catch (error) {
      throw redirect({ to: "/login" });
    }
  },
});
