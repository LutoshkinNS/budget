import { Suspense } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";
import { CreateExpense, ExpensesByDays } from "@/modules/expenses";

export function Main() {
  return (
    <>
      <CreateExpense />
      <Suspense fallback={<Loader />}>
        <ExpensesByDays />
      </Suspense>
    </>
  );
}
