import type { Category, StoredCategory } from '../types/category.js';

import { isCategoryIconKey } from './category-icon.js';

export function serializeCategory(category: StoredCategory): Category {
  if (category.type !== 'income' && category.type !== 'expense') {
    throw new Error('Invalid category type');
  }

  return {
    id: category.id,
    accountId: category.accountId,
    type: category.type,
    name: category.name,
    iconKey: isCategoryIconKey(category.iconKey) ? category.iconKey : null
  };
}
