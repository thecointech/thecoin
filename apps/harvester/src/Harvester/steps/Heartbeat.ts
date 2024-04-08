import { HarvestData, ProcessingStage } from '../types';
import { log } from '@thecointech/logging';
import { getWallet } from '../config';
import { GetHarvesterApi, GetStatusApi } from '@thecointech/apis/broker';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';

export class Heartbeat implements ProcessingStage {

  async process(_data: HarvestData) {

    log.info("Sending Heartbeat");

    if (process.env.HARVESTER_DRY_RUN) {
      log.info(`Skipping Heartbeat: DRY_RUN`);
      return {};
    }

    const wallet = await getWallet();
    const serverTimestamp = await GetStatusApi().timestamp();
    const result = "success";
    const signedPacket = await GetSignedMessage(
      result + serverTimestamp.data,
      wallet!,
    )
    const r = await GetHarvesterApi().heartbeat({
      timeMs: serverTimestamp.data,
      result: "success",
      signature: signedPacket.signature,
    });
    log.info(`Sent Heartbeat: ${r.statusText}`);


    return {};
  }
}
