import { useState } from "react";
import styles from "./index.module.less";
import { Button, Dimmer, Header, Loader, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { groupKey } from "../routes";
import { AccountMap } from "@thecointech/shared/containers/AccountMap/reducer";
import { ElectronSigner } from "@thecointech/electron-signer";

type State = "connecting" | "connected" | "failed";
type ConnectCB = (state: State) => void;

export const Connect = () => {

  const [state, setState] = useState<State>();
  const onConnection: ConnectCB = (state) => {
    setState(state);
  }
  const connecting = state === "connecting";

  return (
    <div className={styles.connectContainer}>
      <Dimmer active={connecting}>
        <Loader>Use your browser to connect to your Coin account...</Loader>
      </Dimmer>
      <DoConnect onConnection={onConnection} state={state} />
      <HasAddress />
      <Link to={`/${groupKey}/1/?manual=true`}>Or load your account manually</Link>
    </div>
  );
};

const DoConnect = ({ onConnection, state }: { onConnection: ConnectCB, state: State|undefined }) => {
  // const [connecting, setConnecting] = useState(false);

  const accountApi = AccountMap.useApi();
  const existing = AccountMap.useAsArray();

  const connect = () => {
    onConnection("connecting");
    window.scraper.loadWalletFromSite().then(res => {
      if (res.error) {
        alert(res.error);
        onConnection("failed");
      } else {
        onConnection("connected");
        if (res.value?.address) {
          existing.forEach(accountApi.deleteAccount);
          accountApi.addAccount(res.value?.name, res.value?.address, new ElectronSigner(res.value.address));
          accountApi.setActiveAccount(res.value?.address);
        }
      }
    });
  };
  const connecting = state === "connecting";

  return (
    <>
      <div>
        <Header size="small">Connect Your Account</Header>
        <p>
          Connect the Harvester to your Coin account. <br />
          This is necessary for the Harvester to interact
          with your account and automate bill payments.
        </p>
      </div>

      <Message info>
        <strong>Note:</strong> This will open a secure connection dialog to authenticate
        your wallet. Your private keys never leave your device.
      </Message>

      <div className={styles.connectButtons}>
        <div>
          <Button
            onClick={connect}
            disabled={connecting}
            loading={connecting}
          >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        </div>
        <BackgroundTaskProgressBar type="connect" />
        <BackgroundTaskErrors type="connect" />
      </div>
    </>
  );
};

const HasAddress = () => {
  const active = AccountMap.useActive();
  const address = active?.address;
  const isConnected = !!address;

  return (
    <Message warning={!isConnected} success={isConnected}>
      <div className={styles.statusContent}>
        <div>
        <span className={styles.statusTitle}>
          {isConnected ? "Connected" : "Not Connected"}
        </span>
        <span className={styles.statusIcon}>
          {isConnected ? "✓" : "⚠"}
        </span>
        </div>
        {isConnected ? (
          <div className={styles.statusAddress}>
            {active?.name} - {address}
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
