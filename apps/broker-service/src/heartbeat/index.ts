import { setHeartbeat } from '@thecointech/broker-db/user';
import { log } from '@thecointech/logging';
import { GetSigner } from '@thecointech/utilities/SignedMessages';

export type Heartbeat = {
  timeMs: number;
  signature: string;
  errors?: string[];
}

const FiveMins = 5 * 60 * 1000;

export async function heartbeat(request: Heartbeat) {

  const signer = await GetSigner({
    message: (request.errors?.join() ?? "") + request.timeMs,
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

  if (request.errors?.length) {
    log.error(
      {address: signer, errors: request.errors},
      'Heartbeat Reported Error: {address}, {errors}'
    )
  }
  else {
    log.info({address: signer}, 'Heartbeat From: {address}')
  }
  await setHeartbeat(signer, request.errors)
  return true;
}
