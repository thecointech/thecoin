import React, { useCallback } from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import { NavLink, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { accountMapApi, useAccounts } from "@the-coin/shared/containers/AccountMap";
import avatar from './images/avatars/16user_avatar16.svg';

import { AccountState } from "@the-coin/shared/containers/Account/types";
import { FormattedMessage, useIntl } from 'react-intl';
import styles from './styles.module.less';


const titleMsg = { id: 'site.AccountSwitcher.login', defaultMessage:'LOG IN'};
const myAccounts = {  id:"site.AccountSwitcher.myAccounts", 
                      defaultMessage:"My Accounts",
                      description:"Title for the My Accounts title in the menu"};
const addAccount = {  id:"site.AccountSwitcher.addAccount", 
                      defaultMessage:"Add an Account",
                      description:"Title for the Add an Account in the menu"};
const see = {   id:"site.AccountSwitcher.see", 
                defaultMessage:"See",
                description:"Title for the See in the menu"};
const settings = {    id:"site.AccountSwitcher.settings", 
                      defaultMessage:"Settings",
                      description:"Title for the Settings in the menu"};
const signout = {   id:"site.AccountSwitcher.signout", 
                    defaultMessage:"Sign Out",
                    description:"Title for the Sign Out in the menu"};


export const AccountSwitcher = () => {

  const {active, map} = useAccounts();
  const activeAccount = active 
    ? map[active]
    : undefined;
  
  const dispatch = useDispatch();
  const doSetActive = useCallback((_: React.MouseEvent<HTMLDivElement>, data: DropdownItemProps) => {
    const accounts = accountMapApi(dispatch);
    accounts.setActiveAccount(data.address)
  }, [dispatch])

  const allAccounts = Object.values(map);

  // Build the title of the dropdown - LOGIN text or avatar and account name
  const intl = useIntl();
  let titleMsgUsed = intl.formatMessage(titleMsg);
  let trigger = (
    <span>{titleMsgUsed}</span>
  );
  if( activeAccount ){
    titleMsgUsed = activeAccount.name.substring(0, 10);  
    trigger = (
      <span>
        <img src={avatar} className={styles.avatars}/> {titleMsgUsed}
      </span>
    );
  }

  return (
    <Dropdown trigger={trigger}  >
      <Dropdown.Menu>
        <Dropdown.Header>
          <FormattedMessage {...myAccounts}/>
        </Dropdown.Header>
        <ActiveAccount account={activeAccount} />
        {
          allAccounts
            .filter(account => account.address !== activeAccount?.address)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(account => (
              <Dropdown.Item 
                trigger={trigger}
                key={account.address} 
                address={account.address}
                text={account.name}
                as={Link} 
                onClick={doSetActive} 
                to="/accounts/" />
              )
            )
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
  account: AccountState|undefined
}
const ActiveAccount = ({account}: ActiveProps) =>
  account
  ? <Dropdown.Item key={account.name}>
      <Dropdown trigger={<span><img src={avatar} className={styles.avatars}/> {account.name.substring(0, 14) + '...'}</span>}>
        <Dropdown.Menu direction='right'>
          <Dropdown.Item key="see" account={account.name} as={Link} to="/accounts/" >
              <FormattedMessage {...see} />
          </Dropdown.Item>
          <Dropdown.Item key="sett" as={NavLink} to="/accounts/settings" >
              <FormattedMessage {...settings} />
          </Dropdown.Item>
          <Dropdown.Item key="sout" as={NavLink} to="/accounts/signout" >
              <FormattedMessage {...signout} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Dropdown.Item>
  : null