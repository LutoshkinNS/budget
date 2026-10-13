import { inputStrategies } from "../model/input-strategies.ts";
import { KEYBOARD_KEYS } from "../model/keyboard-config.ts";
import { KeyConfig, NumericKeyboardProps } from "../model/types.ts";

import { Key } from "./key.tsx";

import s from "./numeric-keyboard.module.css";

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
