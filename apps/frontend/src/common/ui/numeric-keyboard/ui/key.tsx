import clsx from "clsx";

import type { KeyType } from "../model/types.ts";

import s from "./numeric-keyboard.module.css";

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
