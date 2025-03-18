
// in-place variable expansion
// allows process.env to be modified
export function expand(parsed: Record<string, string|undefined>) {
  Object.entries(parsed).forEach(([key, value]) => {
    if (!value) return;
    const m = /\$\{([^}]+)\}/.exec(value);
    if (m) {
      const varName = m[1];
      const replacement = parsed[varName] ?? process.env[varName];
      if (replacement) {
        value = value.substring(0, m.index) + replacement + value.substring(m.index + m[0].length);
        parsed[key] = value;
      }
    }
  });
  return parsed;
}