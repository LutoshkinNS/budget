import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { TransactionsByDays } from "@/modules/transactions";
import {
  clampFutureMonth,
  getTransactionDateRange,
  PeriodSummary,
} from "@/modules/transactions";
import { UserFilter } from "@/modules/transactions";

import type { DashboardSearchChangeHandler } from "./route.ts";

import s from "./Dashboard.module.css";

type DashboardProps = {
  month: string;
  onSearchChange: DashboardSearchChangeHandler;
  period: Parameters<typeof getTransactionDateRange>[0];
};

export function Dashboard({ month, onSearchChange, period }: DashboardProps) {
  const navigate = useNavigate();
  const handleEdit = (transactionId: number) => {
    void navigate({
      to: "/expenses/$expenseId/edit",
      params: { expenseId: String(transactionId) },
    });
  };
  const [userId, setUserId] = useState<number | null>(null);
  const safeMonth = clampFutureMonth(month);
  const range = useMemo(
    () => getTransactionDateRange(period, safeMonth),
    [period, safeMonth],
  );

  useEffect(() => {
    onSearchChange({ period, month: safeMonth }, { replace: true });
  }, [onSearchChange, period, safeMonth]);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        range={range}
        period={period}
        month={safeMonth}
        onPeriodChange={(nextPeriod) =>
          onSearchChange({ period: nextPeriod, month: safeMonth })
        }
        onMonthChange={(nextMonth) =>
          onSearchChange({ period, month: clampFutureMonth(nextMonth) })
        }
      />
      <UserFilter value={userId} onChange={setUserId} />
      <TransactionsByDays
        onEdit={handleEdit}
        range={range}
        userId={userId}
        onResetUser={() => setUserId(null)}
      />
    </div>
  );
}
