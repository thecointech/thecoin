import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Button, Checkbox, Container, Message, Segment } from 'semantic-ui-react';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { GetPluginsApi } from '@thecointech/apis/broker';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { getFxRate } from '@thecointech/fx-rates';
import { toHuman } from "@thecointech/utilities";
import { sleep } from "@thecointech/async";
import { Signer } from '@ethersproject/abstract-signer';
import { getData, Key, setData } from '../Training/data';
import styles from './plugins.module.less';
import { Link } from 'react-router-dom';
import { useState } from 'react';

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
  const [requestSent, setRequestSent] = useState(false);

  const hasConverter = active?.plugins.some(plugin => plugin.address === converter.address);
  const hasShockAbsorber = active?.plugins.some(plugin => plugin.address === shockAbsorber.address);

  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const balance = active?.balance ?? 0;
  const cadBalance = toHuman(buy * balance * fxRate, true);

  const cnvrtRequested = getData(Key.pluginCnvrtRequested);
  const absrbRequested = getData(Key.pluginAbsrbRequested);


  const onInstallPlugins = async () => {
    if (!active) {
      throw new Error('No active account');
    }
    if (!cnvrtRequested) {
      sendAssignRequest(active.signer, converter.address);
      setData(Key.pluginCnvrtRequested, "true");
    }
    // ensure the timestamp increases...
    await sleep(250);
    if (!absrbRequested) {
      sendAssignRequest(active.signer, shockAbsorber.address);
      setData(Key.pluginAbsrbRequested, "true");
    }
    setRequestSent(true);
  }
  return (
    <Container>
      <h1>Plugins</h1>
      <h4>Balance: ${cadBalance}</h4>
      <Segment>
        In order for the harvester to work,
        you need to have at least the Converter
        plugin installed. It is highly recommended to
        install the ShockAbsorber to protect against
        market downturns as well.
      </Segment>
      <div>
        <div>
          <Checkbox disabled defaultChecked label='UberConverter (required)' />
          {hasConverter || cnvrtRequested ? "Pending" : ""}
        </div>
        <div>
          <Checkbox defaultChecked label='UberConverter (recommended)' />
          {hasShockAbsorber || absrbRequested ? "Pending" : ""}
        </div>
      </div>
      <div>
        You have {active?.plugins.length} plugins installed
      </div>
      <Button onClick={onInstallPlugins}>Install</Button>
      <Message hidden={!requestSent}>
        Your selected plugins are in the process of being installed.
        This can take up to an hour, in the meantime lets setup
        your harvester AI.
        <br />
        <Link to="/train">Setup Training</Link>
      </Message>
    </Container>
  );
}
