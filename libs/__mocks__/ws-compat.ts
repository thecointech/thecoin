import { createRequire } from 'node:module';

// Prefer the browser/jsdom global WebSocket if present
const NativeWS = (globalThis as any).WebSocket;

let Impl: any = NativeWS;
if (!Impl) {
  try {
    // Fallback to Node's ws implementation (supports both CJS/ESM shapes)
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const wsMod = require('ws');
    Impl = wsMod?.default ?? wsMod;
  } catch {
    // Final fallback: no-op class so tests don't explode if ws isn't available
    Impl = class {};
  }
}

export const WebSocket = Impl;
export default Impl;
