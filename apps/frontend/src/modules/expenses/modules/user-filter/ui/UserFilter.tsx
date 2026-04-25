import clsx from "clsx";

import { useAccountMembers } from "@/modules/account-members";

import s from "./UserFilter.module.css";

type UserFilterProps = {
  value: number | null;
  onChange: (id: number | null) => void;
};

export function UserFilter({ value, onChange }: UserFilterProps) {
  const { data: members } = useAccountMembers();

  if (members.length <= 1) return null;

  return (
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
  );
}
