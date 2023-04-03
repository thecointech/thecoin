import { getProcessConfig } from './db';
import { PayVisa } from './PayVisa';
import { RoundUp } from './RoundUp';
import { TransferEverything } from './TransferEverything';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';

export type ConfigShape = {
  stages: {
    name: string,
    args?: Record<string, string|number>,
  }[]
}
export async function hydrateProcessor() {
  const config = await getProcessConfig();
  if (!config?.stages) {
    throw new Error('No config found');
  }

  return config.stages.map(stage => {
    switch (stage.name) {
      case 'roundUp': return new RoundUp(stage.args);
      case 'transferEverything': return new TransferEverything();
      case 'transferLimit': return new TransferLimit(stage.args);
      case 'transferVisaOwing': return new TransferVisaOwing();
      case 'payVisa': return new PayVisa(stage.args);
      default: throw new Error(`Unknown processing stage: ${stage.name}`);
    }
  })
}