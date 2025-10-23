import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Checkbox, Container, Header, Message } from 'semantic-ui-react';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { GetPluginsApi } from '@thecointech/apis/broker';
import { sleep } from "@thecointech/async";
import { getData, Key, setData } from '../Training/data';
import { useEffect, useState } from 'react';
import type { AddressLike, Signer } from 'ethers';
import { ActionButton } from '@/ContentSection/Action';
import { NextButton } from '@/ContentSection/Next';

const converter = await getUberContract();
const shockAbsorber = await getShockAbsorberContract();

const sendAssignRequest = async (signer: Signer, pluginAddress: AddressLike) =>  {
  const api = GetPluginsApi();
  const convRequest = await buildAssignPluginRequest(
    signer,
    pluginAddress,
    ALL_PERMISSIONS,
  );
  await api.assignPlugin({
    ...convRequest,
    permissions: convRequest.permissions.toString(),
    timeMs: convRequest.timeMs.toMillis(),
    signedAt: convRequest.signedAt.toMillis(),
  });
}

const statusText = (hasPlugin: boolean, requestSent: boolean) => {
  if (hasPlugin) return "Installed";
  if (requestSent) return "Pending";
  return "Not installed";
}

export const Plugins = () => {
  const active = AccountMap.useActive();
  const api = AccountMap.useApi();
  const [requestSent, setRequestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [hasConverter, setHasConverter] = useState(false);
  const [hasShockAbsorber, setHasShockAbsorber] = useState(false);

  const [forceValid, setForceValid] = useState(false);

  useEffect(() => {
    (async () => {
      const converterAddress = await converter.getAddress();
      const shockAbsorberAddress = await shockAbsorber.getAddress();
      setHasConverter(active?.plugins.some(plugin => plugin.address === converterAddress) ?? false);
      setHasShockAbsorber(active?.plugins.some(plugin => plugin.address === shockAbsorberAddress) ?? false);
    })()
  }, [active?.plugins]);

  const cnvrtRequestedAddress = getData(Key.pluginCnvrtRequested);
  const absrbRequestedAddress = getData(Key.pluginAbsrbRequested);

  const cnvrtRequested = cnvrtRequestedAddress === active?.address;
  const absrbRequested = absrbRequestedAddress === active?.address;


  const onInstallPlugins = async () => {
    if (!active) {
      throw new Error('No active account');
    }
    setIsSending(true);
    if (!cnvrtRequested && !hasConverter) {
      await sendAssignRequest(active.signer, converter);
      setData(Key.pluginCnvrtRequested, active.address);
    }
    // ensure the timestamp increases...
    await sleep(250);
    if (!absrbRequested && !hasShockAbsorber) {
      await sendAssignRequest(active.signer, shockAbsorber);
      setData(Key.pluginAbsrbRequested, active.address);
    }
    setRequestSent(true);
    setIsSending(false);
    // Trigger refresh of path.  setData does not trigger a re-render,
    // so this just sets 'something has changed' on the base SimplePath
    api.setActiveAccount(null);
    api.setActiveAccount(active.address);
  }

  const canInstallPlugins = requestSent || isSending || (hasConverter && hasShockAbsorber);

  const isValid = () => {
    setForceValid(true);
    return hasConverter || cnvrtRequested;
  };

  return (
    <Container>
      <Header size="small">Plugins</Header>
      <p>
        In order for the harvester to work,
        you need to have at least the Converter
        plugin installed. It is highly recommended to
        install the ShockAbsorber to protect against
        market downturns as well.
      </p>
      <div>
        <div>
          <Checkbox disabled defaultChecked label='UberConverter (required)' />
          {statusText(hasConverter, !!cnvrtRequested)}
        </div>
        <div>
          <Checkbox defaultChecked label='ShockAbsorber (recommended)' />
          {statusText(hasShockAbsorber, !!absrbRequested)}
        </div>
      </div>
      {/* <p style={{ fontSize: "small" }}>
        You have {active?.plugins.length} plugins installed
      </p> */}
      <ActionButton onClick={onInstallPlugins} loading={isSending} disabled={canInstallPlugins}>Install</ActionButton>
      <PluginMessage requestSent={requestSent} forceValid={forceValid} hasConverter={hasConverter} />
      <NextButton to="/agent" content="Connect Bank Account" onValid={isValid} />
    </Container>
  );
}


const PluginMessage = ({requestSent, forceValid, hasConverter}: {requestSent: boolean, forceValid: boolean, hasConverter: boolean}) => {
  if (requestSent) {
    return (
      <Message>
        Your selected plugins are in the process of being installed.
        This can take up to an hour, in the meantime lets setup
        your harvester AI.
      </Message>
    );
  }
  if (hasConverter) {
    return (
      <Message success>
        Your harvester is ready to go!
      </Message>
    );
  }
  if (forceValid) {
    return (
      <Message warning>
        The converter plugin is required for the harvester to function. <br />The converter plugin enables delayed
        bill payments, which the harvester uses to ensure bills are paid at the correct time.
      </Message>
    );
  }
  return null;
}
