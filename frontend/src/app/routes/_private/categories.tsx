import { createFileRoute, redirect } from "@tanstack/react-router";

import { authMe } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { Categories } from "@/pages/categories";

export const Route = createFileRoute("/_private/categories")({
  component: Categories,
  beforeLoad: async () => {
    try {
      await authMe();
    } catch (error) {
      throw redirect({ to: "/login" });
    }
  },
});
