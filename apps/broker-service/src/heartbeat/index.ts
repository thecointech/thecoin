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

  const signer = await GetSigner({
    message: request.result + request.timeMs,
    signature: request.signature,
  });

  const now = Date.now();
  if (request.timeMs < (now - FiveMins)) {
    log.error(
      {signedTime: request.timeMs, now, address: signer},
      'Heartbeat too old: {signedTime}, now: {now} - {address}'
    )
    return false;
  }

  if (request.result != "success") {
    log.error(
      {address: signer, result: request.result},
      'Heartbeat Reported Error: {address}, {result}'
    )
  }
  else {
    log.info({address: signer}, 'Heartbeat From: {address}')
  }
  await setHeartbeat(signer, request.result)
  return true;
}
