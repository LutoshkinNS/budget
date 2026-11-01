import type { CategoryDTO } from "@/common/api/generate/model";

export type CategoryGridItem = Pick<CategoryDTO, "id" | "name" | "iconKey">;

export type CategoryGridProps = {
  categories: CategoryGridItem[];
  value?: CategoryGridItem["id"] | null;
  onChange?: (id: CategoryGridItem["id"] | null) => void;
};
