export const inputStrategies = {
  digit: (value: string, key: string, maxLength: number): string => {
    if (value.replace(",", "").replace(".", "").length >= maxLength) return value;
    return value === "0" ? key : value + key;
  },

  separator: (value: string, separator: string): string => {
    if (value.includes(separator)) return value;
    return value + separator;
  },

  backspace: (value: string): string => {
    return value.length <= 1 ? "0" : value.slice(0, -1);
  },
};
