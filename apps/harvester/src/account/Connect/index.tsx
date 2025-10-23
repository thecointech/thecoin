import { useState } from "react";
import styles from "./index.module.less";
import { Dimmer, Header, Loader, Message } from "semantic-ui-react";
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { groupKey } from "../routes";
import { AccountMap } from "@thecointech/shared/containers/AccountMap/reducer";
import { ElectronSigner } from "@thecointech/electron-signer";
import { ContentSection } from "@/ContentSection";
import { RouteComponentProps } from "react-router";
import { PathNextButton } from "@/SimplePath";
import type { AccountState } from "@thecointech/account";

type State = "connecting" | "connected" | "failed";

export const Connect = (props: RouteComponentProps & AccountState) => {

  const [state, setState] = useState<State>();
  const [forceCheck, setForceCheck] = useState(false);
  const accountApi = AccountMap.useApi();
  const existing = AccountMap.useAsArray();
  const address = props.address;
  const isConnected = !!address;

  const connecting = state === "connecting";

  const connect = () => {
    setState("connecting");
    window.scraper.loadWalletFromSite().then(res => {
      if (res.error) {
        alert(res.error);
        setState("failed");
      } else {
        setState("connected");
        if (res.value?.address) {
          existing.forEach(accountApi.deleteAccount);
          accountApi.addAccount(res.value?.name, res.value?.address, new ElectronSigner(res.value.address));
          accountApi.setActiveAccount(res.value?.address);
        }
      }
    })
    .catch(err => {
      console.error(err);
      setState("failed");
    });
  };

  const checkValid = () => {
    setForceCheck(true);
    return state === "connected" || isConnected;
  };

  return (
    <div className={styles.connectContainer}>
      <Dimmer active={connecting}>
        <Loader>Use your browser to connect to your Coin account...</Loader>
      </Dimmer>
      <InfoElements />
      <ContentSection.Action
        onClick={connect}
        disabled={connecting}
        loading={connecting}
        content="Connect Wallet"
      />
      <div className={styles.connectProgress}>
        <BackgroundTaskProgressBar type="connect" />
        <BackgroundTaskErrors type="connect" />
      </div>
      <ConnectionResult forceCheck={forceCheck} {...props} />
      <ContentSection.Alternate to={`/${groupKey}/1/?manual=true`} content="Or load your account manually" />
      <PathNextButton onValid={checkValid} />
    </div>
  );
};

const InfoElements = () => (
  <>
    <Header size="small">Connect Your Account</Header>
    <p>
      Connect the Harvester to your Coin account. <br />
      This is necessary for the Harvester to interact
      with your account and automate bill payments.
    </p>
    <Message info>
      <strong>Note:</strong> This will open a secure connection dialog to authenticate
      your wallet. Your private keys never leave your device.
    </Message>
  </>
)

const ConnectionResult = (props: { forceCheck: boolean } & AccountState) => {
  const success = !!props.address;
  const visible = props.forceCheck || success;
  return (
    <Message warning={!success} success={success} hidden={!visible}>
      <div className={styles.statusContent}>
        <div>
        <span className={styles.statusTitle}>
          {success ? "Connected" : "Not Connected"}
        </span>
        <span className={styles.statusIcon}>
          {success ? "✓" : "⚠"}
        </span>
        </div>
        {success ? (
          <div className={styles.statusAddress}>
            {props.name} - {props.address}
          </div>
        ) : (
          <div>
            Your harvester is not connected to a Coin account. Click "Connect Wallet" above to get started.
          </div>
        )}
      </div>
    </Message>
  );
};
