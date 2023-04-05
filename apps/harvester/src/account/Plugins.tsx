import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Button, Container } from 'semantic-ui-react';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { GetPluginsApi } from '@thecointech/apis/broker';

const converter = await getUberContract();
const shockAbsorber = await getShockAbsorberContract();

export const Plugins = () => {
  const active = AccountMap.useActive();

  const hasConverter = active?.plugins.some(plugin => plugin.address === converter.address);
  const hasShockAbsorber = active?.plugins.some(plugin => plugin.address === shockAbsorber.address);

  const onInstallPlugins = async () => {
    const api = GetPluginsApi();
    const convRequest = await buildAssignPluginRequest(
      active.signer,
      converter.address,
      ALL_PERMISSIONS,
    );
    await api.assignPlugin(convRequest);

    const absorbRequest = await buildAssignPluginRequest(
      active.signer,
      shockAbsorber.address,
      ALL_PERMISSIONS,
    );
    await api.assignPlugin(absorbRequest);
  }
  return (
    <Container>
      <h1>Plugins</h1>
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
