type TSimpleError = {
  children: string[] | string;
};

export function SimpleError({ children }: TSimpleError) {
  return <div style={{ color: "red" }}>{children}</div>;
}
