import { HarvestData, ProcessingStage } from '../types';
import { log } from '@thecointech/logging';
import { getWallet } from '../config';
import { GetHarvesterApi, GetStatusApi } from '@thecointech/apis/broker';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';

export class Heartbeat implements ProcessingStage {

  readonly name = 'Heartbeat';

  async process(data: HarvestData) {

    log.info("Sending Heartbeat");

    if (process.env.HARVESTER_DRY_RUN) {
      log.info(`Skipping Heartbeat: DRY_RUN`);
      return {};
    }

    const errors = data.errors
      ? Object.keys(data.errors)
      : undefined;

    const wallet = await getWallet();
    const serverTimestamp = await GetStatusApi().timestamp();
    const signedPacket = await GetSignedMessage(
      (errors?.join() ?? "") + serverTimestamp.data,
      wallet!,
    )
    const r = await GetHarvesterApi().heartbeat({
      timeMs: serverTimestamp.data,
      signature: signedPacket.signature,
      errors,
    });
    log.info(`Sent Heartbeat: ${r.statusText}`);


    return {};
  }
}
