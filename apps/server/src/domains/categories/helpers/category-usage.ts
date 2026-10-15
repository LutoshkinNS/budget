import type { Category } from '../types/category.js';

const russianCollator = new Intl.Collator('ru');

export function orderCategoriesByUsage<T extends Pick<Category, 'id' | 'name'>>(
  categories: T[],
  usageCounts: Map<Category['id'], number>
) {
  return [...categories].sort((left, right) => {
    const countDifference =
      (usageCounts.get(right.id) ?? 0) - (usageCounts.get(left.id) ?? 0);
    if (countDifference !== 0) return countDifference;

    const nameDifference = russianCollator.compare(left.name, right.name);
    if (nameDifference !== 0) return nameDifference;

    return left.id - right.id;
  });
}
