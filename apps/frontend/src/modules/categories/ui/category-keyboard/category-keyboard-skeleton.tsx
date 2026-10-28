import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import cardS from "./category-card.module.css";
import s from "./category-keyboard.module.css";

// Декоративная заготовка под шесть карточек существующей сетки;
// количество заглушек не обещает объём данных.
const SKELETON_CARDS_PER_ROW = 3;
const SKELETON_ROWS = 2;

export function CategoryKeyboardSkeleton() {
  return (
    <div className={s.scroll} role="status" aria-label="Загрузка категорий">
      <div className={s.grid}>
        {Array.from({ length: SKELETON_ROWS }, (_, row) => (
          <div className={s.row} key={row}>
            {Array.from({ length: SKELETON_CARDS_PER_ROW }, (_, card) => (
              <Skeleton
                key={card}
                {...(cardS.skeletonCard
                  ? { className: cardS.skeletonCard }
                  : {})}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
