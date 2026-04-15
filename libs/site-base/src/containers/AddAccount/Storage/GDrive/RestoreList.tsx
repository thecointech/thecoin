import React, { useEffect, useMemo, useState } from 'react';
import { GoogleWalletItem } from '@thecointech/types';
import { GetSecureApi } from '@thecointech/apis/broker';
import { log } from '@thecointech/logging';
import { List } from 'semantic-ui-react';
import { AccountMap } from '@thecointech/redux-accounts';
import { AccountState } from '@thecointech/account';
import { isPresent, NormalizeAddress } from '@thecointech/utilities';
import { Wallet } from 'ethers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Navigate, useLocation } from 'react-router';
import { PageHeader } from '../../../../components/PageHeader';
import { ButtonPrimary } from '../../../../components/Buttons';
import { useFromQuery } from '../../utils';
import { clientUri } from './googleUtils';
import styles from './styles.module.less';

const aboveTheTitle = defineMessage({defaultMessage: "Restore Account", description: "The above the title text for the restore account page"});
const title = defineMessage({defaultMessage: "Accounts in your Google Drive", description: "The main title for the restore account page"});
const pleaseWait = defineMessage({ defaultMessage: 'Please wait; Loading Accounts', description: 'Loading message when fetching wallets' })
const noAccounts = defineMessage({ defaultMessage: 'No accounts found', description: 'AccountsList: no accounts loaded from google' })
const goTo = defineMessage({ defaultMessage: 'Go To This Account', description: 'AccountsList button to go to account' })
const restore = defineMessage({ defaultMessage: 'Restore', description: 'AccountsList button to load account into site'})

export const RestoreList = () => {

  const [wallets, setWallets] = useState<GoogleWalletItem[]>()
  const accountsApi = AccountMap.useApi();
  const accounts = AccountMap.useAsArray();
  const [redirect, setRedirect] = useState('');

  // Reuse the hook for it's hardening
  const from = useFromQuery('/')
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token');

  ///////////////////////////////////////////////
  // Load Wallets
  useEffect(() => {

    if (token) {
      const api = GetSecureApi();
      api.googleRetrieve(clientUri, { token })
        .then(({data}) => setWallets(data.wallets))
        .catch((err: Error) => log.error(err, `Error fetching wallets: ${err.message}`))
    }
  }, [token]);

  const parsed = useMemo(() => wallets
    ? parseWallets(wallets, accounts)
    : undefined,
    [wallets, accounts]
  );

  // Set wallet into local storage
  const onRestore = (wallet: ParsedWallet) => {
    if (wallet.exists) {
      accountsApi.setActiveAccount(wallet.address);
      setRedirect(from);
    }
    else {
      accountsApi.addAccount(wallet.name, wallet.address, wallet.wallet);
    }
  }

  ///////////////////////////////////////////////
  // If we have requested to redirect
  if (redirect) {
    return <Navigate to={redirect} />
  }

  return wallets == undefined
    ? <FormattedMessage {...pleaseWait} />
    : wallets.length === 0
      ? <FormattedMessage {...noAccounts} />
      : (
        <>
          <PageHeader above={aboveTheTitle} title={title} />
          <div className={`${styles.listAccount} x10spaceAfter`}>
            <List divided verticalAlign='middle' >
              {
                parsed?.map((wallet) => (
                  <List.Item key={wallet.id}>
                    <List.Content className={styles.accountRow}>
                      <div className={styles.nameWallet}>{wallet.name}</div>
                      <ButtonPrimary className={`${styles.buttonRestore} x2spaceBefore x2spaceAfter`} floated='right'
                        wallet={wallet}
                        onClick={() => onRestore(wallet)}
                      >
                        <FormattedMessage {...(
                          wallet.exists ? goTo : restore
                        )} />
                      </ButtonPrimary>
                    </List.Content>
                  </List.Item>
                ))
              }
            </List>
          </div>
        </>
      )
}

type ParsedWallet = ReturnType<typeof parseWallets>[number]
const parseWallets = (wallets: GoogleWalletItem[], accounts: AccountState[]) => {
  let r = wallets.map(w => {
    if (!w.wallet) {
      log.error(`Wallet missing from stored account: ${w.id}`);
      return;
    }
    const wallet: Wallet = JSON.parse(w.wallet);
    const address = NormalizeAddress(wallet.address);
    return {
      wallet,
      exists: !!accounts.find(account => account.address === address),
      id: w.id.id,
      name: w.id.name?.split('.wallet')[0] ?? w.id.id,
      address,
    }
  });
  return r
    .filter((w, i) => r.findIndex(s => s?.wallet.address === w?.wallet.address) === i)
    .filter(isPresent)
    .filter(w => w.name || w.id)
}
