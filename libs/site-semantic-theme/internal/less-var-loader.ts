import lessToJs from 'less-vars-to-js';
import camelcase from 'camelcase';
import type { LoaderContext } from 'webpack';

interface LoaderQuery {
  camelCase?: boolean;
  resolveVariables?: boolean;
}

export default function (this: LoaderContext<LoaderQuery>, source: string) {
  if (this.cacheable) {
    this.cacheable();
  }

  const query = this.getOptions();
  const camelCaseKeys = !!query.camelCase;
  const resolveVariables = query.resolveVariables !== false; // default to true

  const varRgx = /^@/;
  const vars: Record<string, string> = lessToJs(source);
  const keys = Object.keys(vars);
  if (!keys.length) {
    this.emitWarning(new Error('Could not find any extractable less variables!'));
  }

  if (resolveVariables) {
    const followVar = (value: string, seen = new Set<string>()): string => {
      if (value === undefined) {
        return '';
      }
      if (varRgx.test(value)) {
        if (seen.has(value)) {
          this.emitWarning(new Error(`Circular variable reference detected: ${value}`));
          return value;
        }
        seen.add(value);
        // value is a variable
        return followVar(vars[value], seen);
      }
      return value;
    };
    for (const [key, value] of Object.entries(vars)) {
      vars[key] = followVar(value);
    }
  }

  const transformKey = (key: string): string => {
    let ret = key.replace(varRgx, '');
    if (camelCaseKeys) {
      ret = camelcase(ret);
    }
    return ret;
  };

  const transformedVars = Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [transformKey(key), value])
  );

  return `export default ${JSON.stringify(transformedVars)};`;
}
