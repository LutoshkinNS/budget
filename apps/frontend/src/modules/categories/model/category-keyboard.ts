import type { CategoryDTO } from "@/common/api/generate/model";

export type Category = Pick<CategoryDTO, "id" | "name" | "iconKey">;

export type CategoryKeyboardProps = {
  categories: Category[];
  value?: Category["id"] | null;
  onChange?: (id: Category["id"] | null) => void;
};
