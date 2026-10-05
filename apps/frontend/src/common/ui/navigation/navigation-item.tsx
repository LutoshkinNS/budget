import { Link, type LinkProps } from "@tanstack/react-router";

import { SvgIcon, type SvgIconComponent } from "@/common/ui/svg-icon/svg-icon";

import s from "./navigation-item.module.css";

export type NavigationItemProps = {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: SvgIconComponent;
};

export function NavigationItem({ to, label, icon }: NavigationItemProps) {
  return (
    <li className={s.item}>
      <Link to={to} aria-label={label} title={label} className={s.link}>
        <SvgIcon component={icon} />
        <span className={s.label}>{label}</span>
      </Link>
    </li>
  );
}
