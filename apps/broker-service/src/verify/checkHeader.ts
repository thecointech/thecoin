import { createHmac } from 'crypto';
import { log } from '@thecointech/logging';

const secret = process.env.BLOCKPASS_WEBHOOK_SECRET ?? "secret";

export function checkHeader(header: string, body: Buffer) {

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!header) return false;
  if (!body) return false;

  const hash = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  log.debug(`Calculated HMAC hash ${hash}`);
  return hash == header;
}
