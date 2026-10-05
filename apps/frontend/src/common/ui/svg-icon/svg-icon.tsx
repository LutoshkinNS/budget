import type { ComponentType, SVGProps } from "react";
import clsx from "clsx";

import s from "./svg-icon.module.css";

export type SvgIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SvgIconProps = {
  component: SvgIconComponent;
  size?: number;
  className?: string;
  label?: string;
};

export function SvgIcon({
  component: Component,
  size = 24,
  className,
  label,
}: SvgIconProps) {
  return (
    <Component
      width={size}
      height={size}
      className={clsx(s.icon, className)}
      focusable="false"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
