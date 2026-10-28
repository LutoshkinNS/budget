import clsx from "clsx";

import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";
import { useAccountMembers } from "@/modules/account-members";

import s from "./user-filter.module.css";

type UserFilterProps = {
  value: number | null;
  onChange: (id: number | null) => void;
};

export function UserFilter({ value, onChange }: UserFilterProps) {
  const {
    data: members,
    hasAccount,
    hasValidData,
    isError,
    isLoading,
  } = useAccountMembers();

  if (!hasAccount) return null;

  if (isLoading) {
    return (
      <div className={s.loading} role="status" aria-label="Загрузка участников">
        <Skeleton {...(s.loadingChip ? { className: s.loadingChip } : {})} />
        <Skeleton {...(s.loadingChip ? { className: s.loadingChip } : {})} />
      </div>
    );
  }

  return (
    <>
      {isError && (
        <p className={s.errorState} role="alert">
          {hasValidData
            ? "Не удалось обновить список участников"
            : "Не удалось загрузить участников"}
        </p>
      )}
      {members.length > 1 && (
        <div className={s.chips} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={value === null}
            className={clsx(s.chip, value === null && s.chipActive)}
            onClick={() => onChange(null)}
          >
            все
          </button>
          {members.map((m) => (
            <button
              key={m.userId}
              type="button"
              role="tab"
              aria-selected={value === m.userId}
              className={clsx(s.chip, value === m.userId && s.chipActive)}
              onClick={() => onChange(m.userId)}
            >
              {m.firstName ?? `User ${m.userId}`}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
