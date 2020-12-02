import React, { useCallback } from "react";
import { GoogleWalletItem } from "@the-coin/types";
import { useAccountMap, useAccountMapApi } from "@the-coin/shared/containers/AccountMap";
import { List, Button, ButtonProps } from "semantic-ui-react";
import { Wallet } from "ethers";
import { NormalizeAddress } from "@the-coin/utilities";
import { Dictionary } from "lodash";
import { useHistory } from "react-router";
import styles from './styles.module.less';

type Props = {
  wallets: GoogleWalletItem[],
}

type LoadingWallet = {
  wallet: Wallet;
  name: string;
  id: string;
  exists: true;
}
export const AccountList = ({ wallets }: Props) => {
  const existing = useAccountMap();

  const loadableWallets: Dictionary<LoadingWallet> = {};
  wallets.forEach(w => {
    if (!w.id.name || !w.id.id)
      return;

    const wallet = JSON.parse(w.wallet!) as Wallet;
    const address = NormalizeAddress(wallet.address);
    if (!loadableWallets[address]) {
      loadableWallets[address] = {
        wallet,
        exists: !!existing[address],
        id: w.id.id,
        name: w.id.name.split('.wallet')[0]
      }
    }
  });

  const accountMapApi = useAccountMapApi();
  const history = useHistory();
  const onRestore = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    event?.preventDefault();
    const loadable: LoadingWallet = data.loadable;
    var {name, wallet, exists} = loadable;
    if (exists) {
      accountMapApi.setActiveAccount(wallet.address);
      history.push("/accounts")
    }
    else {
      accountMapApi.addAccount(name, wallet, true);
    }
  }, [accountMapApi, history])


  return wallets
    ? (
      <List divided relaxed>
        {
          Object
            .keys(loadableWallets)
            .map(address => {
              const w = loadableWallets[address];
              return (
                <List.Item key={w.id}>
                  <List.Content className={styles.accountRow}>
                    {w.name}
                    <Button
                      loadable={w}
                      onClick={onRestore}
                    >
                      {
                        w.exists ? 'GO TO' : 'RESTORE'
                      }
                    </Button>
                  </List.Content>
                </List.Item>
              )
            })
        }
      </List>
    )
    : null;
}
