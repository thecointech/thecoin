import React from "react";
import { GoogleWalletItem } from "@thecointech/types";
import { useAccountStore, useAccountStoreApi } from "@thecointech/shared/containers/AccountMap";
import { List, Button, ButtonProps } from "semantic-ui-react";
import { Wallet } from "ethers";
import { NormalizeAddress } from "@thecointech/utilities";
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
  exists: boolean;
}
export const AccountList = ({ wallets }: Props) => {
  const {accounts} = useAccountStore();
  const accountsApi = useAccountStoreApi();
  const history = useHistory();

  const loadableWallets: Dictionary<LoadingWallet> = {};
  wallets.forEach(w => {
    if (!w.id.name || !w.id.id)
      return;

    const wallet = JSON.parse(w.wallet!) as Wallet;
    const address = NormalizeAddress(wallet.address);
    if (!loadableWallets[address]) {
      loadableWallets[address] = {
        wallet,
        exists: !!accounts.find(account => account.address === address),
        id: w.id.id,
        name: w.id.name.split('.wallet')[0]
      }
    }
  });

  const onRestore = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    event?.preventDefault();
    const loadable: LoadingWallet = data.loadable;
    var {name, wallet, exists} = loadable;
    if (exists) {
      accountsApi.setActiveAccount(wallet.address);
      history.push("/")
    }
    else {
      accountsApi.addAccount(name, wallet);
    }
  }


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
