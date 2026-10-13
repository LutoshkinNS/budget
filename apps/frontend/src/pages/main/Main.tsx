import { useNavigate } from "@tanstack/react-router";

import { CreateTransaction, TransactionsByDays } from "@/modules/transactions";

export function Main() {
  const navigate = useNavigate();
  const handleEdit = (transactionId: number) => {
    void navigate({
      to: "/expenses/$expenseId/edit",
      params: { expenseId: String(transactionId) },
    });
  };
  return (
    <>
      <CreateTransaction />
      <TransactionsByDays onEdit={handleEdit} />
    </>
  );
}
