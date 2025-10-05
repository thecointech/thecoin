import { useEffect, useState } from "react";
import styles from "./index.module.less";
import { Button, Header, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { groupKey } from "../routes";
// import { ContentSection } from '@/ContentSection';

export const Connect = () => {
  const [address, setAddress] = useState<string | null>();

  useEffect(() => {
    window.scraper.getCoinAccountDetails().then(res => {
      if (res.error) {
        alert(res.error);
      } else if (res.value) {
        setAddress(res.value.address);
      }
    });
  }, []);

  return (
    <div className={styles.connectContainer}>
      <DoConnect onConnectionComplete={() => window.location.reload()} />
      <HasAddress address={address} />
      <Link to={`/${groupKey}/2/?manual=true`}>Or load your account manually</Link>
    </div>
  );
};

const DoConnect = ({ onConnectionComplete }: { onConnectionComplete?: () => void }) => {
  const [connecting, setConnecting] = useState(false);

  const connect = () => {
    setConnecting(true);
    window.scraper.loadWalletFromSite().then(res => {
      if (res.error) {
        alert(res.error);
        setConnecting(false);
      } else {
        setConnecting(false);
        onConnectionComplete?.();
      }
    });
  };

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

      <div>
        <Button
          onClick={connect}
          disabled={connecting}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        <BackgroundTaskProgressBar type="connect" />
        <BackgroundTaskErrors type="connect" />
      </div>
    </>
  );
};

const HasAddress = ({ address }: { address?: string | null }) => {
  const isConnected = !!address;

  return (
    <Message info={!isConnected} success={isConnected}>
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
            Harvester is connected to: {address}
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
