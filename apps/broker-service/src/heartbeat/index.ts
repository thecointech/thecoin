import { setHeartbeat } from '@thecointech/broker-db/user';
import { log } from '@thecointech/logging';
import { GetSigner } from '@thecointech/utilities/SignedMessages';

export type Heartbeat = {
  timeMs: number;
  signature: string;
  result: string;
}

export async function heartbeat(request: Heartbeat) {
  if (request.timeMs < (Date.now() - 5000)) {
    log.error({signedTime: request.timeMs}, 'Heartbeat too old: {signedTime}')
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
