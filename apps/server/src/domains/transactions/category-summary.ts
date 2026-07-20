type CurrentCategoryExpense = {
  categoryId: number;
  categoryName: string;
  amount: number;
  transactionCount: number;
};

type PreviousCategoryExpense = {
  categoryId: number;
  amount: number;
};

export function calculateChangePercent(
  currentAmount: number,
  previousAmount: number
) {
  if (previousAmount === 0) {
    return null;
  }

  return ((currentAmount - previousAmount) / previousAmount) * 100;
}

export function buildCategorySummaryResponse({
  current,
  previous
}: {
  current: CurrentCategoryExpense[];
  previous: PreviousCategoryExpense[];
}) {
  const previousAmounts = new Map(
    previous.map(({ categoryId, amount }) => [categoryId, amount])
  );
  const totalExpense = current.reduce(
    (total, category) => total + category.amount,
    0
  );
  const previousTotalExpense = previous.reduce(
    (total, category) => total + category.amount,
    0
  );
  const transactionCount = current.reduce(
    (total, category) => total + category.transactionCount,
    0
  );

  return {
    totalExpense,
    previousTotalExpense,
    changePercent: calculateChangePercent(totalExpense, previousTotalExpense),
    transactionCount,
    categories: current
      .map((category) => {
        const previousAmount = previousAmounts.get(category.categoryId) ?? 0;

        return {
          ...category,
          percentage:
            totalExpense === 0 ? 0 : (category.amount / totalExpense) * 100,
          previousAmount,
          changePercent: calculateChangePercent(category.amount, previousAmount)
        };
      })
      .sort((first, second) => second.amount - first.amount)
  };
}
