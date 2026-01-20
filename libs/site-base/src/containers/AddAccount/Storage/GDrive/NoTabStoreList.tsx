import React, { useState } from 'react';
import { List } from 'semantic-ui-react';
import { AccountMap } from '@thecointech/redux-accounts';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import styles from './styles.module.less';
import { PageHeader } from '../../../../components/PageHeader';
import { ButtonPrimary } from '../../../../components/Buttons';
import { isLocal } from '@thecointech/signers';
import { completeStore } from './googleUtils';

// type LoadingWallet = {
//   wallet: Wallet;
//   name: string;
//   id: string;
//   exists: boolean;
// }

const aboveTheTitle = defineMessage({defaultMessage: "Store Account", description: "Title for StorePage when window.open doesn't work"});
const title = defineMessage({defaultMessage: "Select which account to upload", description: "The main title for the restore account page"});
const noAccounts = defineMessage({ defaultMessage: 'No local accounts found', description: 'AccountsList: no accounts able to save to google' })
const store = defineMessage({ defaultMessage: 'Store Account', description: 'AccountsList button to load account into site'})
const uploading = defineMessage({ defaultMessage: 'Uploading', description: 'AccountsList button to load account into site'})
const complete = defineMessage({ defaultMessage: 'Complete', description: 'AccountsList button to load account into site'})

type Props = {
  code: string
}
export const NoTabStoreList = ({code}: Props) => {

  // const [redirect, setRedirect] = useState('');
  const accounts = AccountMap.useData().map;
  const [states, setStates] = useState(
    Object.keys(accounts).reduce((acc, address) => ({...acc, [address]: store }), {} as Record<string, MessageDescriptor>)
  );

  const onStore = async (address: string) => {
    setStates(p => ({...p, [address]: uploading}))
    await completeStore(code, address);
    setStates(p => ({...p, [address]: complete}))
  }

  ///////////////////////////////////////////////
  // If we have requested to redirect
  // if (redirect) {
  //   return <Redirect to={redirect} />
  // }
  const localSigners = Object.values(accounts).filter(ac => isLocal(ac.signer))
  return localSigners.length == 0
      ? <FormattedMessage {...noAccounts} />
      : (
        <>
          <PageHeader above={aboveTheTitle} title={title} />
          <div className={`${styles.listAccount} x10spaceAfter`}>
            <List divided verticalAlign='middle' >
              {localSigners
                .map(account => (
                  <List.Item key={account.address}>
                    <List.Content className={styles.accountRow}>
                      <div className={styles.nameWallet}>{account.name}</div>
                      <ButtonPrimary className={`${styles.buttonRestore} x2spaceBefore x2spaceAfter`} floated='right'
                        address={account.address}
                        onClick={(_, data) => onStore(data.address)}
                        loading={states[account.address] == uploading}
                      >
                        <FormattedMessage {...states[account.address]} />
                      </ButtonPrimary>
                    </List.Content>
                  </List.Item>
                )
                )}
            </List>
          </div>
        </>
      )
}
