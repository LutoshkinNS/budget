import clsx from "clsx";

import s from "./Input.module.css";

type InputProps = {
  variant?: "default" | "borderless";
  fullWidth?: boolean;
} & React.ComponentPropsWithoutRef<"input">;

export function Input({
  variant = "default",
  fullWidth = true,
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={clsx(
        s.input,
        variant === "borderless" && s.borderless,
        fullWidth && s.fullWidth,
        className,
      )}
      {...props}
    />
  );
}
