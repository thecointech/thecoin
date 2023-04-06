import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Button, Container } from 'semantic-ui-react';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { GetPluginsApi } from '@thecointech/apis/broker';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { getFxRate } from '@thecointech/fx-rates';
import { toHuman } from "@thecointech/utilities";
import { sleep } from "@thecointech/async";
import { Signer } from '@ethersproject/abstract-signer';

const converter = await getUberContract();
const shockAbsorber = await getShockAbsorberContract();

const sendAssignRequest = async (signer: Signer, pluginAddress: string) =>  {
  const api = GetPluginsApi();
  const convRequest = await buildAssignPluginRequest(
    signer,
    pluginAddress,
    ALL_PERMISSIONS,
  );
  await api.assignPlugin({
    ...convRequest,
    timeMs: convRequest.timeMs.toMillis(),
    signedAt: convRequest.signedAt.toMillis(),
  });
}

export const Plugins = () => {
  const active = AccountMap.useActive();

  const hasConverter = active?.plugins.some(plugin => plugin.address === converter.address);
  const hasShockAbsorber = active?.plugins.some(plugin => plugin.address === shockAbsorber.address);

  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const { balance } = active!;
  const cadBalance = toHuman(buy * balance * fxRate, true);

  const onInstallPlugins = async () => {
    if (!active) {
      throw new Error('No active account');
    }
    sendAssignRequest(active.signer, converter.address);
    // ensure the timestamp increases...
    await sleep(250);
    sendAssignRequest(active.signer, shockAbsorber.address);
  }
  return (
    <Container>
      <h1>Plugins</h1>
      <h4>Balance: ${cadBalance}</h4>
      <div>
        In order for the harvester to work,
        you need to have both the Converter
        and the ShockAbsorber plugins installed.
      </div>
      <div>UberConverter: {hasConverter}</div>
      <div>ShockAbsorber: {hasShockAbsorber}</div>
      <div>
        You have {active?.plugins.length} plugins
      </div>
      <Button onClick={onInstallPlugins}>Install</Button>
    </Container>
  );
}
