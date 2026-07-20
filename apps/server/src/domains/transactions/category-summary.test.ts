import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildCategorySummaryResponse,
  calculateChangePercent
} from './category-summary.js';

describe('calculateChangePercent', () => {
  it('returns percent difference from the previous amount', () => {
    assert.equal(calculateChangePercent(125, 100), 25);
    assert.equal(calculateChangePercent(75, 100), -25);
  });

  it('returns null when the previous amount is zero', () => {
    assert.equal(calculateChangePercent(125, 0), null);
    assert.equal(calculateChangePercent(0, 0), null);
  });
});

describe('buildCategorySummaryResponse', () => {
  it('builds sorted category expense analytics for the current period', () => {
    const summary = buildCategorySummaryResponse({
      current: [
        {
          categoryId: 2,
          categoryName: 'Транспорт',
          amount: 50,
          transactionCount: 1
        },
        {
          categoryId: 1,
          categoryName: 'Еда',
          amount: 100,
          transactionCount: 2
        }
      ],
      previous: [
        {
          categoryId: 1,
          amount: 80
        },
        {
          categoryId: 3,
          amount: 40
        }
      ]
    });

    assert.deepEqual(summary, {
      totalExpense: 150,
      previousTotalExpense: 120,
      changePercent: 25,
      transactionCount: 3,
      categories: [
        {
          categoryId: 1,
          categoryName: 'Еда',
          amount: 100,
          percentage: 66.66666666666666,
          previousAmount: 80,
          changePercent: 25,
          transactionCount: 2
        },
        {
          categoryId: 2,
          categoryName: 'Транспорт',
          amount: 50,
          percentage: 33.33333333333333,
          previousAmount: 0,
          changePercent: null,
          transactionCount: 1
        }
      ]
    });
  });

  it('keeps percentages at zero when the current total is zero', () => {
    const summary = buildCategorySummaryResponse({
      current: [
        {
          categoryId: 1,
          categoryName: 'Еда',
          amount: 0,
          transactionCount: 0
        }
      ],
      previous: []
    });

    assert.equal(summary.categories[0]?.percentage, 0);
  });
});
