type TFormBlock = {
  children?: React.ReactNode;
  legend?: string;
} & React.ComponentPropsWithoutRef<"form">;

export function FormBlock({ children, legend, ...otherProps }: TFormBlock) {
  return (
    <form {...otherProps}>
      <fieldset>
        <legend>{legend}</legend>
        {children}
      </fieldset>
    </form>
  );
}
