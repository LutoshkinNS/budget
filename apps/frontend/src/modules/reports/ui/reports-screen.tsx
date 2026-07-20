import { Loader } from "@/common/ui/loader/Loader.tsx";
import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";

import {
  buildReportsPeriodRanges,
  getCurrentMonthValue,
  type ReportsPeriod,
  type ReportsPeriodSelection,
} from "../model/period.ts";
import {
  type ReportsCategory,
  type ReportsCategoryTransaction,
  useReportsCategorySummary,
  useReportsCategoryTransactions,
} from "../model/use-category-analytics.ts";

import s from "./reports-screen.module.css";

type ReportsScreenProps = {
  periodSelection: ReportsPeriodSelection;
  selectedCategoryId: number | undefined;
  onPeriodSelectionChange: (periodSelection: ReportsPeriodSelection) => void;
  onCategorySelect: (categoryId: number) => void;
  onCategoryClose: () => void;
};

const PERIOD_LABELS: Record<ReportsPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  range: "Диапазон",
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatExpenseShare(value: number): string {
  return `${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })}% от расходов`;
}

function formatPeriodChange(value: number | null): string {
  if (value === null) return "К прошлому периоду: нет данных";
  return `${formatPercent(value)} к прошлому периоду`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type PeriodControlsProps = {
  periodSelection: ReportsPeriodSelection;
  onPeriodSelectionChange: (periodSelection: ReportsPeriodSelection) => void;
};

function PeriodControls({
  periodSelection,
  onPeriodSelectionChange,
}: PeriodControlsProps) {
  const update = (change: Partial<ReportsPeriodSelection>) => {
    onPeriodSelectionChange({ ...periodSelection, ...change });
  };

  return (
    <section className={s.periodSection} aria-label="Период отчёта">
      <div className={s.periodTabs} role="tablist" aria-label="Период">
        {(Object.keys(PERIOD_LABELS) as ReportsPeriod[]).map((period) => (
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
            {PERIOD_LABELS[period]}
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

function CategoryItem({
  category,
  onClick,
}: {
  category: ReportsCategory;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={s.category}
      onClick={onClick}
      aria-label={`Открыть операции категории ${category.categoryName}`}
    >
      <span className={s.categoryHeader}>
        <span className={s.categoryName}>{category.categoryName}</span>
        <span className={s.categoryAmount}>{formatMoney(category.amount)}</span>
      </span>
      <span className={s.barTrack} aria-hidden="true">
        <span
          className={s.barValue}
          style={{
            width: `${Math.min(Math.max(category.percentage, 0), 100)}%`,
          }}
        />
      </span>
      <span className={s.categoryMeta}>
        <span>{formatExpenseShare(category.percentage)}</span>
        <span>{formatPeriodChange(category.changePercent)}</span>
        <span>{category.transactionCount} операций</span>
      </span>
    </button>
  );
}

function Operations({
  transactions,
  isLoading,
}: {
  transactions: ReportsCategoryTransaction[];
  isLoading: boolean;
}) {
  if (isLoading) return <Loader />;
  if (!transactions?.length)
    return <p className={s.empty}>Операций за этот период нет.</p>;

  return (
    <ul className={s.operations}>
      {transactions.map((transaction) => (
        <li key={transaction.id} className={s.operation}>
          <span>
            <strong>{formatMoney(transaction.amount)}</strong>
            {transaction.description && (
              <small>{transaction.description}</small>
            )}
          </span>
          <time dateTime={transaction.date}>
            {formatDate(transaction.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}

function CategorySheet({
  category,
  from,
  to,
  onClose,
}: {
  category: ReportsCategory | null;
  from: string;
  to: string;
  onClose: () => void;
}) {
  const operationsQuery = useReportsCategoryTransactions({
    categoryId: category?.categoryId ?? null,
    from,
    to,
  });

  if (!category) return null;

  return (
    <div className={s.sheetOverlay} role="presentation" onClick={onClose}>
      <section
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-sheet-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={s.sheetHandle} />
        <div className={s.sheetHeader}>
          <div>
            <h2 id="category-sheet-title">{category.categoryName}</h2>
            <p>
              {formatMoney(category.amount)} ·{" "}
              {formatExpenseShare(category.percentage)} ·{" "}
              {category.transactionCount} операций
            </p>
          </div>
          <button
            type="button"
            className={s.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
            autoFocus
          >
            ×
          </button>
        </div>
        <p className={s.sheetChange}>
          {formatPeriodChange(category.changePercent)}
        </p>
        <h3>Операции</h3>
        {operationsQuery.isError ? (
          <SimpleError>Не удалось загрузить операции.</SimpleError>
        ) : (
          <Operations
            transactions={operationsQuery.transactions}
            isLoading={operationsQuery.isLoading}
          />
        )}
      </section>
    </div>
  );
}

export function ReportsScreen({
  periodSelection,
  selectedCategoryId,
  onPeriodSelectionChange,
  onCategorySelect,
  onCategoryClose,
}: ReportsScreenProps) {
  const ranges = buildReportsPeriodRanges(periodSelection);
  const summaryQuery = useReportsCategorySummary(ranges);
  const summary = summaryQuery.summary;
  const selectedCategory =
    summary?.categories.find(
      (category) => category.categoryId === selectedCategoryId,
    ) ?? null;

  return (
    <div className={s.container}>
      <h1 className={s.title}>Отчёты</h1>
      <PeriodControls
        periodSelection={periodSelection}
        onPeriodSelectionChange={onPeriodSelectionChange}
      />
      {summaryQuery.isLoading && <Loader />}
      {summaryQuery.isError && (
        <SimpleError>Не удалось загрузить отчёт.</SimpleError>
      )}
      {summary && (
        <>
          <section className={s.summary} aria-label="Сводка расходов">
            <span>Расходы</span>
            <strong>{formatMoney(summary.totalExpense)}</strong>
            <div>
              <span>{formatPeriodChange(summary.changePercent)}</span>
              <span>{summary.transactionCount} операций</span>
            </div>
          </section>
          <section className={s.categories} aria-labelledby="categories-title">
            <h2 id="categories-title">Категории</h2>
            {summary.categories.length ? (
              <div className={s.categoryList}>
                {summary.categories.map((category) => (
                  <CategoryItem
                    key={category.categoryId}
                    category={category}
                    onClick={() => onCategorySelect(category.categoryId)}
                  />
                ))}
              </div>
            ) : (
              <p className={s.empty}>Расходов за выбранный период пока нет.</p>
            )}
          </section>
        </>
      )}
      <CategorySheet
        category={selectedCategory}
        from={ranges.current.from}
        to={ranges.current.to}
        onClose={onCategoryClose}
      />
    </div>
  );
}
