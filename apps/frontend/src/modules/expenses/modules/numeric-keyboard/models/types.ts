export type KeyType = "digit" | "separator" | "backspace";

export type NumericKeyboardProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onConfirm?: (value: string) => void;
};

export type KeyConfig = {
  label: string;
  type: KeyType;
  value?: string;
};
