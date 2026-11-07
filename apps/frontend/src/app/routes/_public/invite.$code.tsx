import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Invite } from "@/pages/invite";

function InviteRoute() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  return (
    <Invite
      code={code}
      navigateToLogin={() => void navigate({ to: "/login" })}
      navigateHome={() => void navigate({ to: "/" })}
    />
  );
}

export const Route = createFileRoute("/_public/invite/$code")({
  component: InviteRoute,
});
