// in-place variable expansion
// allows process.env to be modified
export function expand(parsed: Record<string, string|undefined>) {
  Object.entries(parsed).forEach(([key, value]) => {
    if (!value) return;
    
    const regex = /\$\{([^}]+)\}/;
    let newValue = value;
    let lastValue;
    
    // Keep expanding until no more changes are made
    // This handles nested variables if they exist
    do {
      lastValue = newValue;
      const match = regex.exec(newValue);
      if (match) {
        const varName = match[1];
        const replacement = parsed[varName] ?? process.env[varName];
        if (replacement) {
          newValue = newValue.substring(0, match.index) + 
                    replacement + 
                    newValue.substring(match.index + match[0].length);
        }
      }
    } while (newValue !== lastValue);
    
    parsed[key] = newValue;
  });
  return parsed;
}