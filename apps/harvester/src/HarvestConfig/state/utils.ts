export const safeParseFloat = (str: string) => {
    const f = parseFloat(str);
    if (isNaN(f)) return 0;
    return f;
  }