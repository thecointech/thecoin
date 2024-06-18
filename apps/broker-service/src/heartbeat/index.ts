import { setHeartbeat } from '@thecointech/broker-db/user';
import { log } from '@thecointech/logging';
import { GetSigner } from '@thecointech/utilities/SignedMessages';

export type Heartbeat = {
  timeMs: number;
  signature: string;
  result: string;
}

const FiveMins = 5 * 60 * 1000;

export async function heartbeat(request: Heartbeat) {
  const now = Date.now();
  if (request.timeMs < (now - FiveMins)) {
    log.error({signedTime: request.timeMs, now}, 'Heartbeat too old: {signedTime}, now: {now}')
    return false;
  }
  const signer = await GetSigner({
    message: request.result + request.timeMs,
    signature: request.signature,
  });

  log.info({signer}, 'Heartbeat From: {signer}')
  await setHeartbeat(signer, request.result)
  return true;
}
