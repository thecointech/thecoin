import React, { useCallback } from "react"
import { Dropdown, DropdownItemProps } from "semantic-ui-react"
import { NavLink, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { accountMapApi, useAccounts } from "@the-coin/shared/containers/AccountMap"

import cross from './images/cross.svg';
import { AccountState } from "@the-coin/shared/containers/Account/types"
import { FormattedMessage, useIntl } from 'react-intl';


let intl = useIntl();
const titleMsg = intl.formatMessage({ id: 'site.AccountSwitcher.login', defaultMessage:'LOG IN'});
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

  return (
    <Dropdown text={titleMsg} >
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
                key={account.address} 
                text={account.name}
                address={account.address}
                description='' 
                as={Link} 
                onClick={doSetActive} 
                to="/accounts/" />
              )
            )
        }
        <Dropdown.Divider />
        <Dropdown.Item key='add' description='' icon='add' as={NavLink} to="/addAccount/">
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
  ? <Dropdown.Item key={name}>
      <Dropdown image={{ avatar: false, src: cross }} text={account.name.substring(0, 14) + '...'}>
        <Dropdown.Menu direction='right'>
          <Dropdown.Item key="see" account={name} description='' as={Link} to="/accounts/" >
              <FormattedMessage {...see} />
          </Dropdown.Item>
          <Dropdown.Item key="sett" text='Settings' description='' as={NavLink} to="/accounts/settings" >
              <FormattedMessage {...settings} />
          </Dropdown.Item>
          <Dropdown.Item key="sout" text='Sign Out' description='' as={NavLink} to="/accounts/signout" >
              <FormattedMessage {...signout} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Dropdown.Item>
  : null