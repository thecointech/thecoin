import { useState, useEffect } from "react";
import { Button, Dimmer, Dropdown, Loader, Message } from "semantic-ui-react";
import { isRunning, useBackgroundTask } from "@/BackgroundTask";
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { BankConnectReducer } from "@/Agent/state/reducer";
import type { RendererBankType } from "@/Agent/state/types";

type AccountSelect = {
  key: string;
  text: string;
  value: RendererBankType;
}
export const RefreshTwoFA = ({ paused }: { paused: boolean }) => {
  BankConnectReducer.useStore();
  const data = BankConnectReducer.useData();

  // const [accountType, setAccountType] = useState<RendererBankType | undefined>();
  const [availableAccounts, setAvailableAccounts] = useState<Array<AccountSelect>>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountSelect | undefined>();
  const [didRefresh, setDidRefresh] = useState<AccountSelect[]>();

  const refreshTask = useBackgroundTask('twofaRefresh');
  const recordTask = useBackgroundTask('record');
  const replayTask = useBackgroundTask('replay');

  const scraperRunning = isRunning(refreshTask) || isRunning(recordTask) || isRunning(replayTask);

  useEffect(() => {
    const accounts: typeof availableAccounts = [];

    if (data.banks.chequing?.completed) {
      accounts.push({ key: 'chequing', text: data.banks.chequing.name ?? "Chequing", value: 'chequing' });
    }
    if (data.banks.credit?.completed) {
      if (data.banks.credit.url !== data.banks.chequing?.url) {
        accounts.push({ key: 'credit', text: data.banks.credit.name ?? "Credit", value: 'credit' });
      }
    }

    setAvailableAccounts(accounts);

    // If only one account type is available, auto-select it
    if (accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [data]);

  const disabled = paused || scraperRunning || selectedAccount === undefined;

  const refreshTwoFA = async () => {
    if (selectedAccount === undefined) return;

    const r = await window.scraper.twofaRefresh(selectedAccount.value);
    if (r.error) {
      // Note: errors automatically displayed below
      // setDidRefresh(false)
    }
    else {
      setDidRefresh((prev) => [...(prev || []), selectedAccount]);
    }
  };

  return (
    <>
      <span style={{position: "relative"}}>
        <Dimmer active={isRunning(refreshTask)}>
          <Loader>Refreshing 2FA...</Loader>
        </Dimmer>
        <p>
          If your two-factor authentication is expired, you can run this to refresh it.
        </p>

        {availableAccounts.length === 0 && (
          <Message warning size="small" style={{ marginBottom: "0.75em" }}>
            No bank accounts connected.
          </Message>
        )}

        {availableAccounts.length > 1 && (
          <div style={{ marginBottom: "0.75em" }}>
            <Dropdown
              placeholder="Choose Account Type"
              fluid
              selection
              disabled={disabled}
              options={availableAccounts}
              onChange={(_, data) => {
                const selected = availableAccounts.find(a => a.value === data.value);
                setSelectedAccount(selected);
              }}
              value={selectedAccount?.value}
            />
          </div>
        )}

        {availableAccounts.length === 1 && (
          <Message info size="small" style={{ marginBottom: "0.75em" }}>
            Connected to: <strong>{availableAccounts[0].text}</strong>
          </Message>
        )}

        <div style={{ marginBottom: "0.75em" }}>
          <Button
            onClick={refreshTwoFA}
            disabled={disabled}
            loading={isRunning(refreshTask)}
          >
            Start 2FA Refresh
          </Button>
        </div>
      </span>

      {scraperRunning && (
        <>
          <BackgroundTaskProgressBar type="twofaRefresh" />
        </>
      )}
      <RefreshSuccess accountType={selectedAccount?.value} didRefresh={didRefresh} />
      <BackgroundTaskErrors type="twofaRefresh" />
    </>
  );
};

const RefreshSuccess = ({ accountType, didRefresh }: { accountType?: RendererBankType, didRefresh?: AccountSelect[] }) => {
  const refreshed = didRefresh?.find(a => a.value === accountType);
  if (!refreshed) return null;
  return (
    <Message success size="small" style={{ marginBottom: "0.75em" }}>
      Refreshed 2FA for:&nbsp;
      <strong>
        {refreshed.text}
      </strong>
    </Message>
  )
}

