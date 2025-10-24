import { ParseError } from "./errors";

function parseForm(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of body.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const k = eq >= 0 ? pair.slice(0, eq) : pair;
    const v = eq >= 0 ? pair.slice(eq + 1) : '';
    // application/x-www-form-urlencoded encodes spaces as '+',
    // so convert '+' back to space before decodeURIComponent
    const key = decodeURIComponent(k.replace(/\+/g, ' '));
    const val = decodeURIComponent((v || '').replace(/\+/g, ' '));
    out[key] = val;
  }
  return out;
}


export function parse(raw: string, ct?: string) {

  if (ct === 'application/json') {
    return JSON.parse(raw);
  } else if (ct === 'application/x-www-form-urlencoded') {
    const payload = parseForm(raw);
    return payload;
  } else if (!ct) {
    // Some browsers may omit content-type for form posts
    const payload = parseForm(raw);
    return payload;
  }
  throw new ParseError('Unsupported Media Type');
}
