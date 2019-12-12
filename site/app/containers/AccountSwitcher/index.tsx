import React, { useCallback } from "react"
import { Dropdown, DropdownItemProps } from "semantic-ui-react"
import { NavLink, Link } from "react-router-dom"
import { selectActiveAccount } from "containers/Accounts/Selectors"
import { selectAccounts } from "@the-coin/components/containers/Account/selector"
import { DispatchAccounts } from "containers/Accounts/Reducer"
import { useDispatch } from "react-redux"

import cross from './images/cross.svg';
//import dot from './images/greendot.svg';

//import { AccountMap } from "@the-coin/components/containers/Account/types"


//const isLoggedIn = (accounts: AccountMap, name: string) => accounts[name].signer != null;


export const AccountSwitcher = () => {

  const allAccounts = selectAccounts();
  const allNames = Object.keys(allAccounts);
  const activeAccount = selectActiveAccount();

  const dispatch = useDispatch();
  const doSetActive = useCallback((event: React.MouseEvent<HTMLDivElement>, data: DropdownItemProps) => {
    const accounts = DispatchAccounts(dispatch);
    accounts.setActiveAccount(data.account)
  }, [dispatch])

  return (
    <Dropdown button text='My Account' id='createAccountHeader' direction='left'>
      <Dropdown.Menu>
        <Dropdown.Header>My Accounts</Dropdown.Header>
        {allNames
            .filter(account => account == activeAccount)
            .map(name => 
              <Dropdown.Item>
                <Dropdown image={{ avatar: false, src: cross }} text={name.substring(0, 14)+'...'}>
                  <Dropdown.Menu direction='right'>
                  <Dropdown.Item key={name} text='See' account={name} description='' as={Link} onClick={doSetActive} to="/accounts/" />
                    <Dropdown.Item text='Settings' description='' as={NavLink} to="/accounts/settings" />
                    <Dropdown.Item text='Sign Out' description='' as={NavLink} to="/accounts/signout" />
                  </Dropdown.Menu>
                </Dropdown>
              </Dropdown.Item>)
          }
        {allNames
            .filter(account => account != activeAccount)
            .map(name => <Dropdown.Item key={name} text={name} account={name} description='' as={Link} onClick={doSetActive} to="/accounts/" />)
          }
        
        <Dropdown.Item text='Add a New Account' description='' image={{ avatar: false, src: cross }} as={NavLink} to="/addAccount/generate/" />
        
        <Dropdown.Item text='Login' description='' image={{ avatar: false, src: cross }} as={NavLink} to="/addAccount/restore/" />
      </Dropdown.Menu>
    </Dropdown>
  )
}
