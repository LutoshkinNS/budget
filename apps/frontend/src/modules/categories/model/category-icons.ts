import type { CategoryIconKeyDTO } from "@/common/api/generate/model";
import apartment from "@/common/assets/category-icons/apartment.png";
import beauty from "@/common/assets/category-icons/beauty.png";
import car from "@/common/assets/category-icons/car.png";
import clothes from "@/common/assets/category-icons/clothes.png";
import education from "@/common/assets/category-icons/education.png";
import games from "@/common/assets/category-icons/games.png";
import gifts from "@/common/assets/category-icons/gifts.png";
import groceries from "@/common/assets/category-icons/groceries.png";
import health from "@/common/assets/category-icons/health.png";
import home from "@/common/assets/category-icons/home.png";
import internet from "@/common/assets/category-icons/internet.png";
import leisure from "@/common/assets/category-icons/leisure.png";
import meals from "@/common/assets/category-icons/meals.png";
import mobile from "@/common/assets/category-icons/mobile.png";
import pets from "@/common/assets/category-icons/pets.png";
import publicTransport from "@/common/assets/category-icons/public-transport.png";
import sport from "@/common/assets/category-icons/sport.png";
import subscriptions from "@/common/assets/category-icons/subscriptions.png";
import taxi from "@/common/assets/category-icons/taxi.png";
import travel from "@/common/assets/category-icons/travel.png";

const categoryIconsByKey = {
  groceries: { key: "groceries", name: "Продукты", src: groceries },
  meals: { key: "meals", name: "Еда", src: meals },
  clothes: { key: "clothes", name: "Одежда", src: clothes },
  sport: { key: "sport", name: "Спорт", src: sport },
  car: { key: "car", name: "Автомобиль", src: car },
  home: { key: "home", name: "Дом", src: home },
  leisure: { key: "leisure", name: "Досуг", src: leisure },
  mobile: { key: "mobile", name: "Мобильная связь", src: mobile },
  internet: { key: "internet", name: "Интернет", src: internet },
  gifts: { key: "gifts", name: "Подарки", src: gifts },
  "public-transport": {
    key: "public-transport",
    name: "Общественный транспорт",
    src: publicTransport,
  },
  pets: { key: "pets", name: "Питомцы", src: pets },
  subscriptions: { key: "subscriptions", name: "Подписки", src: subscriptions },
  games: { key: "games", name: "Игры", src: games },
  education: { key: "education", name: "Образование", src: education },
  travel: { key: "travel", name: "Путешествия", src: travel },
  taxi: { key: "taxi", name: "Такси", src: taxi },
  apartment: { key: "apartment", name: "Квартира", src: apartment },
  health: { key: "health", name: "Здоровье", src: health },
  beauty: { key: "beauty", name: "Красота", src: beauty },
} as const satisfies {
  [Key in CategoryIconKeyDTO]: { key: Key; name: string; src: string };
};

export const CATEGORY_ICONS = Object.values(categoryIconsByKey);

export type CategoryIconKey = CategoryIconKeyDTO;

export function getCategoryIcon(iconKey: string | null | undefined) {
  return CATEGORY_ICONS.find((icon) => icon.key === iconKey);
}
