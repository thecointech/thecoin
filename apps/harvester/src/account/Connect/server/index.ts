import { createServer, IncomingMessage } from 'http';
import { AddressInfo } from 'net';
import { URL } from 'url';
import { shell } from 'electron';
import { setCoinAccount } from '@/Harvester/config';
import { parse } from './parse';
import { validate } from './validate';
import { bad, okFile } from './returnValues';
import { ValidationError } from './errors';
import { getAsset } from '@/Harvester/notify';
import { mockServer } from './mock';
import { BackgroundTaskCallback } from '@/BackgroundTask';
import { startService, resetService } from './state';
import { CoinAccountDetails } from '@thecointech/store-harvester';
export { resetService } from './state';

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

export async function loadWalletFromSite(callback: BackgroundTaskCallback, timeoutMs = 5 * 60_000): Promise<CoinAccountDetails|undefined> {
  // Ensure only one active session
  if (globalThis.ConnectService) {
    globalThis.ConnectService.reject?.(new Error('Cancelled'));
    await resetService({ error: "Cancelled, new connection starting" });
  }

  const service = startService(callback);

  if (process.env.CONFIG_NAME === 'development') {
    return await mockServer(service);
  }

  service.server = createServer(async (req, res) => {
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
      if (!service?.state || stateParam !== service?.state) {
        return bad(res, 400, 'Invalid state');
      }

      const ct = (req.headers['content-type'] || '').split(';')[0].trim();
      const raw = await readBody(req);

      const payload = parse(raw, ct);

      const validated = validate(payload, service.state);

      await setCoinAccount({
        encrypted: validated.walletFile,
        address: validated.address,
        name: validated.name,
        mnemonic: {
          phrase: validated.phrase,
          path: validated.path,
          locale: validated.locale,
        },
      })

      // TODO: Persist encrypted walletFile, but in a way that is friendly to sign-in

      // Serve a static HTML page confirming success
      const successPath = getAsset('success.html');
      okFile(res, successPath!);

      // Resolve success and teardown
      service.resolve?.({
        address: validated.address,
        name: validated.name,
      });
      resetService({ completed: true, percent: 100 });
    } catch (err) {
      if (err instanceof ValidationError) {
        bad(res, 400, err.message);
      } else {
        bad(res, 500, 'Server error');
      }
      service?.reject?.(err as Error);
      resetService({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // Bind ephemeral port on loopback
  await new Promise<void>((resolve, reject) => {
    service?.server?.listen(0, '127.0.0.1', () => resolve());
    service?.server?.on('error', reject);
  });


  const { port } = service.server.address() as AddressInfo;

  // Build consent URL from env
  const base = process.env.URL_SITE_APP || '';
  if (!base) {
    await resetService({ error: 'URL_SITE_APP is not configured' });
    throw new Error('URL_SITE_APP is not configured');
  }

  const consentUrl = `${base.replace(/\/$/, '')}/#/harvester/connect?port=${encodeURIComponent(String(port))}&state=${encodeURIComponent(service.state!)}`;
  await shell.openExternal(consentUrl);

  // Timeout and cleanup
  const p = new Promise<CoinAccountDetails>((resolve, reject) => {
    service!.resolve = resolve;
    service!.reject = reject;
    service!.timeout = setTimeout(() => {
      resetService({ error: 'Timeout waiting for wallet from site' });
      reject(new Error('Timeout waiting for wallet from site'));
    }, timeoutMs).unref();
  });

  return p.finally(() => {
    resetService();
  });
}
