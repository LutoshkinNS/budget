import { getCategoryIcon } from "../model/category-icons";

import styles from "./category-icon.module.css";

interface CategoryIconProps {
  iconKey?: string | null | undefined;
  className?: string | undefined;
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps) {
  const icon = getCategoryIcon(iconKey);

  if (!icon) return null;

  return (
    <img
      src={icon.src}
      alt=""
      width={24}
      height={24}
      className={[styles.icon, className].filter(Boolean).join(" ")}
    />
  );
}
