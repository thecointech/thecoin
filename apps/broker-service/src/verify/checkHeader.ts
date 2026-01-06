import { createHmac } from 'crypto';
import { getSecret } from "@thecointech/secrets";

export async function checkHeader(header: string, body: Buffer) {

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!header) return false;
  if (!body) return false;

  const secret = await getSecret("BlockpassWebhookSecret");
  const hash = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return hash == header;
}
