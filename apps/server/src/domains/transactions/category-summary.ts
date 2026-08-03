type CurrentCategoryTransaction = {
  categoryId: number;
  categoryName: string;
  amount: number;
  transactionCount: number;
};

type PreviousCategoryTransaction = {
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
  current: CurrentCategoryTransaction[];
  previous: PreviousCategoryTransaction[];
}) {
  const previousAmounts = new Map(
    previous.map(({ categoryId, amount }) => [categoryId, amount])
  );
  const totalAmount = current.reduce(
    (total, category) => total + category.amount,
    0
  );
  const previousTotalAmount = previous.reduce(
    (total, category) => total + category.amount,
    0
  );
  const transactionCount = current.reduce(
    (total, category) => total + category.transactionCount,
    0
  );

  return {
    totalAmount,
    previousTotalAmount,
    changePercent: calculateChangePercent(totalAmount, previousTotalAmount),
    transactionCount,
    categories: current
      .map((category) => {
        const previousAmount = previousAmounts.get(category.categoryId) ?? 0;

        return {
          ...category,
          percentage:
            totalAmount === 0 ? 0 : (category.amount / totalAmount) * 100,
          previousAmount,
          changePercent: calculateChangePercent(category.amount, previousAmount)
        };
      })
      .sort((first, second) => second.amount - first.amount)
  };
}
