import { createFileRoute } from "@tanstack/react-router";

import { EditExpense } from "@/pages/edit-expense";

export const Route = createFileRoute("/_private/expenses/$expenseId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { expenseId } = Route.useParams();

  return <EditExpense expenseId={Number(expenseId)} />;
}
