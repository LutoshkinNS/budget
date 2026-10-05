import { NavigationItem } from "@/common/ui/navigation/navigation-item";

import { navigationItems } from "../model/navigation-items";

import s from "./navigation.module.css";

export function Navigation() {
  return (
    <nav className={s.container} aria-label="Основная навигация">
      <ul className={s.list}>
        {navigationItems.map((item) => (
          <NavigationItem key={item.to} {...item} />
        ))}
      </ul>
    </nav>
  );
}
