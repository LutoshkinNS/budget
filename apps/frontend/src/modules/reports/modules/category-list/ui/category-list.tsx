import {
  formatExpenseShare,
  formatMoney,
  formatPeriodChange,
} from "../../../model/formatters.ts";
import type { ReportsCategory } from "../../../model/use-category-analytics.ts";

import s from "./category-list.module.css";

export type CategoryListProps = {
  categories: ReportsCategory[];
  onCategorySelect: (categoryId: ReportsCategory["categoryId"]) => void;
};

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

export function CategoryList({
  categories,
  onCategorySelect,
}: CategoryListProps) {
  return (
    <section className={s.categories} aria-labelledby="categories-title">
      <h2 id="categories-title">Категории</h2>
      {categories.length ? (
        <div className={s.categoryList}>
          {categories.map((category) => (
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
  );
}
