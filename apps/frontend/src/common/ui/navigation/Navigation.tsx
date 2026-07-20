import { Link } from "@tanstack/react-router";

import s from "./navigation.module.css";

export function Navigation() {
  return (
    <nav className={s.navigationContainer}>
      <ul className={s.navList}>
        <li className={s.navItem}>
          <Link to="/">Расходы</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/dashboard">Дашборд</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/reports">Отчёты</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/categories">Категории</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/settings">Настройки</Link>
        </li>
      </ul>
    </nav>
  );
}
