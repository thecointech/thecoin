import { AccountMap } from '@thecointech/redux-accounts';
import { Checkbox, CheckboxProps, Container, Header, Label, List, Message, Segment } from 'semantic-ui-react';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { ContractConverter } from '@thecointech/contract-plugin-converter';
import { ContractShockAbsorber } from '@thecointech/contract-plugin-shockabsorber';
import { GetPluginsApi } from '@thecointech/apis/broker';
import { sleep } from "@thecointech/async";
import { getData, Key, setData } from '../Training/data';
import { useEffect, useState } from 'react';
import type { AddressLike, Signer } from 'ethers';
import { isAxiosError } from 'axios';
import { log } from '@thecointech/logging';
import { ActionButton } from '@/ContentSection/Action';
import { NextButton } from '@/ContentSection/Next';
import styles from './Plugins.module.less';

const converter = await ContractConverter.get();
const shockAbsorber = await ContractShockAbsorber.get();

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

const statusColor = (hasPlugin: boolean, requestSent: boolean) => {
  if (hasPlugin) return "green";
  if (requestSent) return "yellow";
  return "grey";
}

const StatusLabel = ({ hasPlugin, requestSent }: { hasPlugin: boolean, requestSent: boolean }) => (
  <Label basic color={statusColor(hasPlugin, requestSent)} size="small" className={styles.pluginStatus}>
    {statusText(hasPlugin, requestSent)}
  </Label>
)

// Translate a failed plugin-assignment request into a message the user can act on.
const describeError = (err: unknown): string => {
  if (isAxiosError(err) && err.response?.status === 401) {
    const message = (err.response.data as { message?: string } | undefined)?.message;
    if (message?.toLowerCase().includes('timestamp')) {
      return "The request was rejected due to an invalid timestamp. " +
        "Please make sure your system date, time and timezone are set correctly (and set to update automatically), then try again.";
    }
    return message ?
      `Request failed with message: ${message}` :
      "Your request could not be verified. Please try again.";
  }
  return "Failed to send the install request. Please check your internet connection and try again.";
}

export const Plugins = () => {
  const active = AccountMap.useActive();
  const api = AccountMap.useApi();
  const [requestSent, setRequestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [addShockAbsorber, setAddShockAbsorber] = useState(true);

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

  // Has -this- account requested the plugins?
  const cnvrtRequested = cnvrtRequestedAddress === active?.address;
  const absrbRequested = absrbRequestedAddress === active?.address;


  const onInstallPlugins = async () => {
    if (!active) {
      throw new Error('No active account');
    }
    setIsSending(true);
    setSendError(null);
    try {
      if (!cnvrtRequested && !hasConverter) {
        await sendAssignRequest(active.signer, converter);
        setData(Key.pluginCnvrtRequested, active.address);
      }
      // ensure the timestamp increases...
      await sleep(250);
      if (addShockAbsorber) {
        if (!absrbRequested && !hasShockAbsorber) {
          await sendAssignRequest(active.signer, shockAbsorber);
          setData(Key.pluginAbsrbRequested, active.address);
        }
      }
      setRequestSent(true);
      // Trigger refresh of path.  setData does not trigger a re-render,
      // so this just sets 'something has changed' on the base SimplePath
      api.setActiveAccount(null);
      api.setActiveAccount(active.address);
    } catch (err) {
      log.error(err, 'Failed to send plugin install request');
      setSendError(describeError(err));
    } finally {
      setIsSending(false);
    }
  }

  const onCheckShockAbsorber = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    // (Cannot de-select after requesting)
    if (absrbRequested) {
      return;
    }
    setAddShockAbsorber(data.checked ?? false);
  };

  const canInstallPlugins = (
    // Already installed
    !(hasConverter && hasShockAbsorber) &&
    (
      // Currently installing
      !isSending &&
      // Not already requested
      (!cnvrtRequested || (!absrbRequested && addShockAbsorber))
    )
  );

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
      <Segment id={styles.pluginContainer}>
        <List relaxed divided>
          <List.Item className={styles.pluginItem}>
            {/* <List.Content floated="right"> */}
              <Checkbox disabled defaultChecked label='UberConverter (required)' />
              <StatusLabel hasPlugin={hasConverter} requestSent={!!cnvrtRequested} />
            {/* </List.Content> */}
            {/* <List.Content> */}
            {/* </List.Content> */}
          </List.Item>
          <List.Item className={styles.pluginItem}>
            {/* <List.Content floated="right"> */}
              <Checkbox checked={addShockAbsorber} onChange={onCheckShockAbsorber} label='ShockAbsorber (recommended)' />
              <StatusLabel hasPlugin={hasShockAbsorber} requestSent={!!absrbRequested} />
            {/* </List.Content> */}
            {/* <List.Content> */}
            {/* </List.Content> */}
          </List.Item>
        </List>
      </Segment>
      <ActionButton onClick={onInstallPlugins} loading={isSending} disabled={!canInstallPlugins}>Install</ActionButton>
      {sendError && <Message negative icon="warning circle" header="Unable to send install request" content={sendError} />}
      <PluginMessage requestSent={requestSent} forceValid={forceValid} hasConverter={hasConverter} />
      <NextButton to="/agent" onValid={isValid} />
    </Container>
  );
}


const PluginMessage = ({requestSent, forceValid, hasConverter}: {requestSent: boolean, forceValid: boolean, hasConverter: boolean}) => {
  if (requestSent) {
    return (
      <Message icon="hourglass half">
        <Message.Content>
          Your selected plugins are in the process of being installed.
          This can take up to an hour, in the meantime lets setup
          your harvester AI.
        </Message.Content>
      </Message>
    );
  }
  if (hasConverter) {
    return (
      <Message success icon="check circle">
        <Message.Content>
          Your harvester is ready to go!
        </Message.Content>
      </Message>
    );
  }
  if (forceValid) {
    return (
      <Message warning icon="warning sign">
        <Message.Content>
          The converter plugin is required for the harvester to function. <br />The converter plugin enables delayed
          bill payments, which the harvester uses to ensure bills are paid at the correct time.
        </Message.Content>
      </Message>
    );
  }
  return null;
}
