import React from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import { NavLink, Link } from "react-router-dom";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import { FormattedMessage, useIntl } from 'react-intl';
import styles from './styles.module.less';
import { AccountState } from '@thecointech/account';
import { defineMessage } from '@formatjs/intl';


const titleMsg = defineMessage({ defaultMessage: 'LOG IN' });
const myAccounts = defineMessage({
  defaultMessage: "My Accounts",
  description: "Title for the My Accounts title in the menu"
});
const addAccount = defineMessage({
  defaultMessage: "Add an Account",
  description: "Title for the Add an Account in the menu"
});

export const AccountSwitcher = () => {

  const accounts = AccountMap.useAsArray();
  const accountsApi = AccountMap.useApi();
  const activeAccount = AccountMap.useActive();

  // Build the title of the dropdown - LOGIN text or avatar and account name
  const intl = useIntl();
  const trigger = activeAccount
    ? <><img src={getAvatarLink("14")} className={styles.avatars} /><span>{activeAccount.name.substring(0, 16)}</span></>
    : intl.formatMessage(titleMsg)
  const onClick = (_: unknown, data: DropdownItemProps) => accountsApi.setActiveAccount(data.address)
  return (
    <Dropdown trigger={trigger} className={styles.dropdown} >
      <Dropdown.Menu>
        <Dropdown.Header>
          <FormattedMessage {...myAccounts} />
        </Dropdown.Header>
        {
          accounts
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(account => (
              <AccountItem account={account} onClick={onClick} active={account.address == activeAccount?.address}/>
            ))
        }
        <Dropdown.Divider />
        <Dropdown.Item key='add' as={NavLink} to="/addAccount/">
          <FormattedMessage {...addAccount} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

type ActiveProps = {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => void,
  account: AccountState | undefined,
  active: boolean,
}
const AccountItem = ({active, onClick, account}: ActiveProps) =>
  account
    ? <Dropdown.Item
        active={active}
        key={account.address}
        address={account.address}
        text={account.name}
        as={Link}
        onClick={onClick}
        to="/" />
    : null
