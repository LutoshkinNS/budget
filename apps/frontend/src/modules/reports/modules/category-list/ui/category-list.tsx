import {
  formatCategoryShare,
  formatMoney,
  formatPeriodChange,
} from "../../../model/formatters.ts";
import type {
  ReportsCategory,
  ReportsTransactionType,
} from "../../../model/use-category-analytics.ts";

import s from "./category-list.module.css";

export type CategoryListProps = {
  categories: ReportsCategory[];
  reportType: ReportsTransactionType;
  onCategorySelect: (categoryId: ReportsCategory["categoryId"]) => void;
};

function CategoryItem({
  category,
  reportType,
  onClick,
}: {
  category: ReportsCategory;
  reportType: ReportsTransactionType;
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
        <span>{formatCategoryShare(category.percentage, reportType)}</span>
        <span>{formatPeriodChange(category.changePercent)}</span>
        <span>{category.transactionCount} операций</span>
      </span>
    </button>
  );
}

export function CategoryList({
  categories,
  reportType,
  onCategorySelect,
}: CategoryListProps) {
  return (
    <section className={s.categories} aria-labelledby="categories-title">
      <h2 id="categories-title">
        Категории {reportType === "expense" ? "расходов" : "доходов"}
      </h2>
      {categories.length ? (
        <div className={s.categoryList}>
          {categories.map((category) => (
            <CategoryItem
              key={category.categoryId}
              category={category}
              reportType={reportType}
              onClick={() => onCategorySelect(category.categoryId)}
            />
          ))}
        </div>
      ) : (
        <p className={s.empty}>
          {reportType === "expense" ? "Расходов" : "Доходов"} за выбранный
          период пока нет.
        </p>
      )}
    </section>
  );
}
