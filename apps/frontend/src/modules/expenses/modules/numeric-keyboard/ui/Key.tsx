import clsx from "clsx";

import type { KeyType } from "../models/types.ts";

import s from "./NumericKeyboard.module.css";

export function Key({
  type,
  children,
  onClick,
}: {
  type: KeyType;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={clsx(
        s.key,
        (type === "backspace" || type === "separator") && s.keyTransparent,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
