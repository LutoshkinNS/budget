import CategoryIconKey from '#s/CategoryIconKey.js';

import type { Category } from '../types/category.js';

export function isCategoryIconKey(
  value: unknown
): value is NonNullable<Category['iconKey']> {
  return CategoryIconKey.enum.some((key) => key === value);
}
