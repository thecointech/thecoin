import React, { useEffect, useState } from 'react';
import { getUrlParameterByName } from '../../../../utils/localState'
import { GoogleWalletItem } from '@thecointech/types';
import { clientUri, GetSecureApi } from '../../../../api';
import { log } from '@thecointech/logging';
import { Button, ButtonProps, List } from 'semantic-ui-react';
import { useAccountStore, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import { AccountState } from '@thecointech/account';
import { NormalizeAddress } from '@thecointech/utilities';
import { Wallet } from 'ethers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import styles from './styles.module.less';

type LoadingWallet = {
  wallet: Wallet;
  name: string;
  id: string;
  exists: boolean;
}
const pleaseWait = defineMessage({ defaultMessage: 'Please wait; Loading Accounts', description: 'Loading message when fetching wallets' })
const noAccounts = defineMessage({ defaultMessage: 'Please wait; Loading Accounts', description: 'Loading message when fetching wallets' })

type Props = {
  url?: string
}
export const RestoreList = ({url}: Props) => {

  const [wallets, setWallets] = useState(undefined as (LoadingWallet[]) | undefined)
  const [redirect, setRedirect] = useState('');
  const accountsApi = useAccountStoreApi();
  const { accounts } = useAccountStore();

  ///////////////////////////////////////////////
  // Load Wallets
  const token = getUrlParameterByName('token', url);
  useEffect(() => {
    if (token) {
      const api = GetSecureApi();
      api.googleRetrieve(clientUri, { token })
        .then(r => parseWallets(r.data.wallets, accounts))
        .then(r => setWallets(r))
        .catch(log.error)
    }
  }, [token]);

  // Set wallet into local storage
  const onRestore = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    event?.preventDefault();
    const loadable: LoadingWallet = data.wallet;
    var { name, wallet, exists } = loadable;
    if (exists) {
      accountsApi.setActiveAccount(wallet.address);
      setRedirect('/');
    }
    else {
      accountsApi.addAccount(name, wallet);
    }
  }

  ///////////////////////////////////////////////
  // If we have requested to redirect
  if (redirect) {
    return <Redirect to={redirect} />
  }

  return wallets == undefined
    ? <FormattedMessage {...pleaseWait} />
    : wallets.length === 0
      ? <FormattedMessage {...noAccounts} />
      : (
        <List divided relaxed>
          {
            wallets.map(wallet => {
              return (
                <List.Item key={wallet.id}>
                  <List.Content className={styles.accountRow}>
                    {wallet.name}
                    <Button
                      wallet={wallet}
                      onClick={onRestore}
                    >
                      {
                        wallet.exists ? 'GO TO' : 'RESTORE'
                      }
                    </Button>
                  </List.Content>
                </List.Item>
              )
            })
          }
        </List>
      )
}

const parseWallets = (wallets: GoogleWalletItem[], accounts: AccountState[]) => {
  let r = wallets.map(w => {
    const wallet = JSON.parse(w.wallet!) as Wallet;
    const address = NormalizeAddress(wallet.address);
    return {
      wallet,
      exists: !!accounts.find(account => account.address === address),
      id: w.id.id,
      name: w.id.name?.split('.wallet')[0] ?? w.id.id
    }
  });
  r = r.filter((w, i) => r.findIndex(s => s.wallet.address === w.wallet.address) != i)
  r = r.filter(w => w.name || w.id)
  return r;
}
