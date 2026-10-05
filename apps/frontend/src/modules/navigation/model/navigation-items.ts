import CategoriesIcon from "@/common/assets/icons/categories.svg?react";
import DashboardIcon from "@/common/assets/icons/dashboard.svg?react";
import ExpensesIcon from "@/common/assets/icons/expenses.svg?react";
import ReportsIcon from "@/common/assets/icons/reports.svg?react";
import SettingsIcon from "@/common/assets/icons/settings.svg?react";
import type { NavigationItemProps } from "@/common/ui/navigation/navigation-item";

export const navigationItems = [
  { to: "/", label: "Расходы", icon: ExpensesIcon },
  { to: "/dashboard", label: "Дашборд", icon: DashboardIcon },
  { to: "/reports", label: "Отчёты", icon: ReportsIcon },
  { to: "/categories", label: "Категории", icon: CategoriesIcon },
  { to: "/settings", label: "Настройки", icon: SettingsIcon },
] as const satisfies readonly NavigationItemProps[];
