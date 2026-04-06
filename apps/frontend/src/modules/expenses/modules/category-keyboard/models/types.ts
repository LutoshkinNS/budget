export type Category = {
  emoji: string;
  label: string;
};

export type CategoryKeyboardProps = {
  categories: Category[];
  value?: string | null;
  onChange?: (label: string | null) => void;
};
