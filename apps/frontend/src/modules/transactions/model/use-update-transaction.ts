import { useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";

import type { TransactionUpdateDTO } from "@/common/api/generate/model";
import { useTransactionsUpdate } from "@/common/api/generate/transactions/transactions.gen.ts";
import { TransactionsUpdateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { invalidateCategories } from "@/modules/categories";
import {
  getCurrentAccountIdSnapshot,
  getCurrentUserIdSnapshot,
  useCurrentAccountId,
} from "@/modules/user";

import {
  invalidateTransaction,
  invalidateTransactionsCategorySummary,
  invalidateTransactionsList,
  invalidateTransactionSummary,
} from "./transaction-cache.ts";

export function useUpdateTransaction(
  transactionId: number,
  sourceAccountId?: number,
  sourceUserId?: number,
) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const currentAccountId = useCurrentAccountId();
  const isActiveRef = useRef(true);

  useLayoutEffect(() => {
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const mutation = useTransactionsUpdate({
    mutation: {
      meta: { localFeedback: true },
      onSuccess: (_data, variables) => {
        const accountId = variables.accountId;
        void invalidateTransactionsList(queryClient, accountId);
        void invalidateTransactionSummary(queryClient, accountId);
        void invalidateTransactionsCategorySummary(queryClient, accountId);
        void invalidateTransaction(
          queryClient,
          accountId,
          variables.transactionId,
        );
        void invalidateCategories(queryClient, accountId);

        const isCurrentActor =
          sourceUserId === undefined ||
          getCurrentUserIdSnapshot(queryClient) === sourceUserId;
        const isCurrentAccount =
          getCurrentAccountIdSnapshot(queryClient) === accountId;

        if (isActiveRef.current && isCurrentActor && isCurrentAccount) {
          addNotification({
            id: `updateTransactionSuccess-${variables.transactionId}-${Date.now()}`,
            type: "success",
            title: "Операция сохранена",
          });
        }
      },
    },
  });

  const updateTransaction = (data: TransactionUpdateDTO) => {
    const accountId = sourceAccountId ?? currentAccountId;
    if (accountId === undefined) {
      return Promise.reject(new Error("Текущий счёт не определён"));
    }

    const normalizedData = {
      ...data,
      description: data.description?.trim() || null,
    };
    const validation = TransactionsUpdateBody.safeParse(normalizedData);

    if (!validation.success) {
      return Promise.reject(new Error(z.prettifyError(validation.error)));
    }

    const updateData: TransactionUpdateDTO = {
      amount: validation.data.amount,
      categoryId: validation.data.categoryId,
      date: validation.data.date,
      description: validation.data.description ?? null,
      type: validation.data.type,
    };

    return mutation.mutateAsync({
      accountId,
      transactionId,
      data: updateData,
    });
  };

  const isUnavailable =
    mutation.isError &&
    (mutation.error?.statusCode === 403 || mutation.error?.statusCode === 404);

  return {
    updateTransaction,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isUnavailable,
    error: mutation.error,
  };
}
