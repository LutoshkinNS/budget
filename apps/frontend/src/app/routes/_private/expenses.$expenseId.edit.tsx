import { createFileRoute } from "@tanstack/react-router";

import { EditTransaction } from "@/pages/edit-transaction";

export const Route = createFileRoute("/_private/expenses/$expenseId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { expenseId } = Route.useParams();

  return <EditTransaction transactionId={Number(expenseId)} />;
}
