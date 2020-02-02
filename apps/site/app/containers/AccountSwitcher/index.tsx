import React, { useCallback } from "react"
import { Dropdown, DropdownItemProps } from "semantic-ui-react"
import { NavLink, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { accountMapApi, useAccounts } from "@the-coin/shared/containers/AccountMap"

import cross from './images/cross.svg';
import { AccountState } from "@the-coin/shared/containers/Account/types"

export const AccountSwitcher = () => {

  const {active, map} = useAccounts();
  const activeAccount = active 
    ? map[active]
    : undefined;
  
  const dispatch = useDispatch();
  const doSetActive = useCallback((_: React.MouseEvent<HTMLDivElement>, data: DropdownItemProps) => {
    const accounts = accountMapApi(dispatch);
    accounts.setActiveAccount(data.account)
  }, [dispatch])

  const allAccounts = Object.values(map);
  return (
    <Dropdown button text='My Account' id='createAccountHeader' direction='right'>
      <Dropdown.Menu>
        <Dropdown.Header>My Accounts</Dropdown.Header>
        <ActiveAccount account={activeAccount} />
        {
          allAccounts
            .filter(account => account.signer.address !== activeAccount?.signer.address)
            .map(account => (
              <Dropdown.Item 
                key={account.name} 
                text={account.name}
                account={account.signer.address}
                description='' 
                as={Link} 
                onClick={doSetActive} 
                to="/accounts/" />
              )
            )
        }
        <Dropdown.Divider />
        <Dropdown.Item key='add' text='Add an Account' description='' image={{ avatar: false, src: cross }} as={NavLink} to="/addAccount/" />
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
          <Dropdown.Item key="see" text='See' account={name} description='' as={Link} to="/accounts/" />
          <Dropdown.Item key="sett" text='Settings' description='' as={NavLink} to="/accounts/settings" />
          <Dropdown.Item key="sout" text='Sign Out' description='' as={NavLink} to="/accounts/signout" />
        </Dropdown.Menu>
      </Dropdown>
    </Dropdown.Item>
  : null