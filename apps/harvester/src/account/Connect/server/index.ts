import { createServer, IncomingMessage, Server } from 'http';
import { AddressInfo } from 'net';
import { randomBytes } from 'crypto';
import { URL } from 'url';
import { shell } from 'electron';
import { setWalletMnemomic } from '../../../Harvester/config';
import { parse } from './parse';
import { validate } from './validate';
import { bad, okFile } from './returnValues';
import { resolve } from 'path';
import { ValidationError } from './errors';
import { getAsset } from '@/Harvester/notify';

// Current in-flight server so we can support cancel
let currentServer: Server | null = null;
let currentResolve: ((v: boolean) => void) | null = null;
let currentReject: ((e: Error) => void) | null = null;
let currentTimeout: NodeJS.Timeout | null = null;
let currentState: string | null = null;

function genState(): string {
  return randomBytes(24).toString('base64url');
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      // prevent abuse
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.socket.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}


export async function cancelGetWalletFromSite(): Promise<boolean> {
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }
  if (currentServer) {
    try { currentServer.close(); } catch {}
    currentServer = null;
  }
  if (currentReject) {
    currentReject(new Error('Cancelled'));
  }
  currentResolve = null;
  currentReject = null;
  currentState = null;
  return true;
}

export async function getWalletFromSite(timeoutMs = 5 * 60_000): Promise<boolean> {
  // Ensure only one active session
  if (currentServer) {
    await cancelGetWalletFromSite();
  }

  currentState = genState();

  const server = createServer(async (req, res) => {
    try {
      if (!req.url || req.method !== 'POST') {
        return bad(res, 404, 'Not Found');
      }

      // Only accept requests to /callback/:state
      const url = new URL(req.url, 'http://127.0.0.1');
      const path = url.pathname || '';
      const parts = path.split('/').filter(Boolean);
      if (parts.length !== 2 || parts[0] !== 'callback') {
        return bad(res, 404, 'Not Found');
      }
      const stateParam = parts[1];
      if (!currentState || stateParam !== currentState) {
        return bad(res, 400, 'Invalid state');
      }

      const ct = (req.headers['content-type'] || '').split(';')[0].trim();
      const raw = await readBody(req);

      const payload = parse(raw, ct);

      const validated = validate(payload, currentState);

      // let payload: any = {};
      // if (ct === 'application/json') {
      //   payload = JSON.parse(raw);
      // } else if (ct === 'application/x-www-form-urlencoded') {
      //   payload = parseForm(raw);
      //   // walletFile may be JSON-stringified
      //   if (payload.walletFile) {
      //     try { payload.walletFile = JSON.parse(payload.walletFile); } catch {}
      //   }
      // } else if (!ct) {
      //   // Some browsers may omit content-type for form posts
      //   payload = parseForm(raw);
      //   if (payload.walletFile) {
      //     try { payload.walletFile = JSON.parse(payload.walletFile); } catch {}
      //   }
      // } else {
      //   return bad(res, 415, 'Unsupported Media Type');
      // }

      // const { state, siteOrigin, address, timestamp, mnemonicPhrase, mnemonicPath, mnemonicLocale } = payload;
      // if (!state || state !== currentState) {
      //   return bad(res, 400, 'Invalid state body');
      // }
      // if (!address || typeof address !== 'string') {
      //   return bad(res, 400, 'Missing address');
      // }
      // if (!timestamp || !isFresh(timestamp)) {
      //   return bad(res, 400, 'Stale or missing timestamp');
      // }
      // if (!siteOrigin || typeof siteOrigin !== 'string') {
      //   return bad(res, 400, 'Missing siteOrigin');
      // }
      // // Best-effort origin check (no backend): ensure same origin prefix as configured site
      // const expected = process.env.URL_SITE_APP || '';
      // if (!expected || getOrigin(expected) !== getOrigin(siteOrigin)) {
      //   return bad(res, 400, 'Unexpected site origin');
      // }

      // // Validate account payload: exactly one active account via either mnemonic or walletFile
      // const hasMnemonic = !!mnemonicPhrase;
      // const hasWalletFile = !!payload.walletFile;
      // if (!hasMnemonic && !hasWalletFile) {
      //   return bad(res, 400, 'No account provided');
      // }

      // if (hasMnemonic) {
      //   const mnemonic: Mnemonic = { phrase: String(mnemonicPhrase), path: mnemonicPath || '', locale: String(mnemonicLocale || 'en') };
      //   // Validate derived address matches claimed address
      //   try {
      //     const derived = HDNodeWallet.fromPhrase(mnemonic.phrase, undefined, mnemonic.path);
      //     if (derived.address.toLowerCase() !== String(address).toLowerCase()) {
      //       return bad(res, 400, 'Address does not match mnemonic');
      //     }
      //   } catch {
      //     return bad(res, 400, 'Invalid mnemonic');
      //   }
      //   await setWalletMnemomic(mnemonic);
      // }
      await setWalletMnemomic({
        phrase: validated.phrase,
        path: validated.path,
        locale: validated.locale,
      })

      // TODO: Persist encrypted walletFile, but in a way that is friendly to sign-in

      // Serve a static HTML page confirming success
      const successPath = getAsset('success.html');
      okFile(res, successPath!);

      // Resolve success and teardown
      if (currentResolve) currentResolve(true);
      if (currentTimeout) { clearTimeout(currentTimeout); currentTimeout = null; }
      if (currentServer) { try { currentServer.close(); } catch {} currentServer = null; }
      currentState = null;
    } catch (err) {
      if (err instanceof ValidationError) {
        bad(res, 400, err.message);
      } else {
        bad(res, 500, 'Server error');
      }
      if (currentReject) currentReject(err as Error);
      if (currentTimeout) { clearTimeout(currentTimeout); currentTimeout = null; }
      if (currentServer) { try { currentServer.close(); } catch {} currentServer = null; }
      currentState = null;
    }
  });

  // Bind ephemeral port on loopback
  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  currentServer = server;

  const { port } = server.address() as AddressInfo;

  // Build consent URL from env
  const base = process.env.URL_SITE_APP || '';
  if (!base) {
    await cancelGetWalletFromSite();
    throw new Error('URL_SITE_APP is not configured');
  }

  const consentUrl = `${base.replace(/\/$/, '')}/#/harvester/connect?port=${encodeURIComponent(String(port))}&state=${encodeURIComponent(currentState!)}`;
  await shell.openExternal(consentUrl);

  // Timeout and cleanup
  const p = new Promise<boolean>((resolve, reject) => {
    currentResolve = resolve;
    currentReject = reject;
    currentTimeout = setTimeout(() => {
      try { server.close(); } catch {}
      currentServer = null;
      currentState = null;
      reject(new Error('Timeout waiting for wallet from site'));
    }, timeoutMs).unref();
  });

  return p.finally(() => {
    currentResolve = null;
    currentReject = null;
    if (currentTimeout) { clearTimeout(currentTimeout); currentTimeout = null; }
    if (currentServer) { try { currentServer.close(); } catch {} currentServer = null; }
    currentState = null;
  });
}
