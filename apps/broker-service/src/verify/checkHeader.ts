import { createHmac } from 'crypto';

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

  return hash == header;
}
