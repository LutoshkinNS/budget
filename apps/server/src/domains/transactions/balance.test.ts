import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateTransactionSummary } from './balance.js';

describe('calculateTransactionSummary', () => {
  it('adds initial balance to income minus expenses since the balance date', () => {
    const summary = calculateTransactionSummary({
      initialBalance: 10000,
      periodIncomeTotal: 5000,
      periodExpenseTotal: 3000,
      balanceIncomeTotal: 7000,
      balanceExpenseTotal: 2500
    });

    assert.deepEqual(summary, {
      initialBalance: 10000,
      incomeTotal: 5000,
      expenseTotal: 3000,
      periodBalance: 2000,
      totalBalance: 14500
    });
  });

  it('keeps period balance independent from initial balance', () => {
    const summary = calculateTransactionSummary({
      initialBalance: 50000,
      periodIncomeTotal: 1000,
      periodExpenseTotal: 4000,
      balanceIncomeTotal: 1000,
      balanceExpenseTotal: 4000
    });

    assert.equal(summary.periodBalance, -3000);
    assert.equal(summary.totalBalance, 47000);
  });

  it('ignores expenses before the initial balance date for current balance', () => {
    const summary = calculateTransactionSummary({
      initialBalance: 10000,
      periodIncomeTotal: 0,
      periodExpenseTotal: 3000,
      balanceIncomeTotal: 0,
      balanceExpenseTotal: 0
    });

    assert.equal(summary.expenseTotal, 3000);
    assert.equal(summary.periodBalance, -3000);
    assert.equal(summary.totalBalance, 10000);
  });
});
