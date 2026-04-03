import { inputStrategies } from "../models/inputStrategies.ts";
import { KEYBOARD_KEYS } from "../models/keyboardConfig.ts";
import { KeyConfig, NumericKeyboardProps } from "../models/types.ts";

import { Key } from "./Key.tsx";

import s from "./NumericKeyboard.module.css";

const decimalSeparator = ",";

export function NumericKeyboard({
  value,
  onChange,
  maxLength = 10,
  onConfirm,
}: NumericKeyboardProps) {
  const handleKey = (key: KeyConfig) => {
    let next: string;

    if (key.type === "digit") {
      next = inputStrategies.digit(value, key.value!, maxLength);
    } else if (key.type === "separator") {
      next = inputStrategies.separator(value, decimalSeparator);
    } else {
      next = inputStrategies.backspace(value);
    }

    onChange(next);
  };

  const keys = KEYBOARD_KEYS.map((key) => {
    const label = key.type === "separator" ? decimalSeparator : key.label;

    return (
      <Key key={key.label} type={key.type} onClick={() => handleKey(key)}>
        {label}
      </Key>
    );
  });

  return (
    <div className={s.keyboardContainer}>
      <div className={s.display}>{value}</div>
      <div className={s.grid}>{keys}</div>
      {onConfirm && (
        <button type="button" onClick={() => onConfirm(value)}>
          Готово
        </button>
      )}
    </div>
  );
}
