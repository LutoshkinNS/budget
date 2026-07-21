import s from "./simple-error.module.css";

type TSimpleError = {
  children: string[] | string;
};

export function SimpleError({ children }: TSimpleError) {
  return <div className={s.error}>{children}</div>;
}
