import React from "react";
import { Dropdown } from "semantic-ui-react";
import { NavLink, Link } from "react-router-dom";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import { FormattedMessage, defineMessages } from 'react-intl';
import styles from './styles.module.less';
import { AccountState } from '@thecointech/account';

const translations = defineMessages({
  titleMsg : {
      defaultMessage: 'LOG IN',
      description: 'app.accountSwitcher.login: label for button'},
  myAccounts : {
      defaultMessage: 'My Accounts',
      description: 'app.accountSwitcher.myAccounts: Title for the My Accounts title in the menu'},
  addAccount : {
      defaultMessage: 'Add an Account',
      description: 'app.accountSwitcher.addAccount: Title for the Add an Account in the menu'},
  see : {
      defaultMessage: 'See',
      description: 'app.accountSwitcher.see: Title for the See in the menu'},
  settings : {
      defaultMessage: 'Settings',
      description: 'app.accountSwitcher.settings: Title for the Settings in the menu'},
  signout : {
      defaultMessage: 'Sign Out',
      description: 'app.accountSwitcher.signout: Title for the sign out in the menu'}
});

export const AccountSwitcher = () => {

  const accounts = AccountMap.useAsArray();
  const accountStore = AccountMap.useApi();
  const activeAccount = AccountMap.useActive();

  // Build the title of the dropdown - LOGIN text or avatar and account name
  const trigger = activeAccount
      ? <span><img src={getAvatarLink("14")} className={styles.avatars}/> {activeAccount.name.substring(0, 10)}</span>
      : <FormattedMessage {...translations.titleMsg} />

  return (
    <Dropdown trigger={trigger}  >
      <Dropdown.Menu>
        <Dropdown.Header>
          <FormattedMessage {...translations.myAccounts}/>
        </Dropdown.Header>
        <ActiveAccount account={activeAccount} />
        {
          accounts
            .filter(account => account.address !== activeAccount?.address)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(account => (
              <Dropdown.Item
                trigger={trigger}
                key={account.address}
                address={account.address}
                text={account.name}
                as={Link}
                onClick={(_, data) => accountStore.setActiveAccount(data.address)}
                to="/" />
              )
            )
        }
        <Dropdown.Divider />
        <Dropdown.Item key='add' as={NavLink} to="/addAccount/">
          <FormattedMessage {...translations.addAccount} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

type ActiveProps = {
  account: AccountState|undefined
}
const ActiveAccount = ({account}: ActiveProps) =>
  account
  ? <Dropdown.Item key={account.name}>
      <Dropdown trigger={<span><img src={getAvatarLink("14")} className={styles.avatars}/> {account.name.substring(0, 14) + '...'}</span>}>
        <Dropdown.Menu direction='right'>
          <Dropdown.Item key="see" account={account.name} as={Link} to="/" >
              <FormattedMessage {...translations.see} />
          </Dropdown.Item>
          <Dropdown.Item key="sett" as={NavLink} to="settings" >
              <FormattedMessage {...translations.settings} />
          </Dropdown.Item>
          <Dropdown.Item key="sout" as={NavLink} to="signout" >
              <FormattedMessage {...translations.signout} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Dropdown.Item>
  : null
