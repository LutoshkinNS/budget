import {
  getCurrentMonthValue,
  type ReportsPeriodSelection,
} from "../../../model/period.ts";

import s from "./period-controls.module.css";

const PERIOD_TABS = [
  { period: "day", label: "День" },
  { period: "week", label: "Неделя" },
  { period: "month", label: "Месяц" },
  { period: "range", label: "Диапазон" },
] as const satisfies ReadonlyArray<{
  period: ReportsPeriodSelection["period"];
  label: string;
}>;

export type PeriodControlsProps = {
  periodSelection: ReportsPeriodSelection;
  onPeriodSelectionChange: (periodSelection: ReportsPeriodSelection) => void;
};

export function PeriodControls({
  periodSelection,
  onPeriodSelectionChange,
}: PeriodControlsProps) {
  const update = (change: Partial<ReportsPeriodSelection>) => {
    onPeriodSelectionChange({ ...periodSelection, ...change });
  };

  return (
    <section className={s.periodSection} aria-label="Период отчёта">
      <div className={s.periodTabs} role="tablist" aria-label="Период">
        {PERIOD_TABS.map(({ period, label }) => (
          <button
            key={period}
            type="button"
            role="tab"
            aria-selected={periodSelection.period === period}
            className={
              periodSelection.period === period
                ? s.periodTabActive
                : s.periodTab
            }
            onClick={() => update({ period })}
          >
            {label}
          </button>
        ))}
      </div>
      {periodSelection.period === "month" && (
        <label className={s.field}>
          <span>Месяц</span>
          <input
            type="month"
            value={periodSelection.month}
            max={getCurrentMonthValue()}
            onChange={(event) => update({ month: event.target.value })}
          />
        </label>
      )}
      {periodSelection.period === "range" && (
        <div className={s.rangeFields}>
          <label className={s.field}>
            <span>От</span>
            <input
              type="date"
              value={periodSelection.fromDate}
              max={periodSelection.toDate}
              onChange={(event) => update({ fromDate: event.target.value })}
            />
          </label>
          <label className={s.field}>
            <span>До</span>
            <input
              type="date"
              value={periodSelection.toDate}
              min={periodSelection.fromDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => update({ toDate: event.target.value })}
            />
          </label>
        </div>
      )}
    </section>
  );
}
