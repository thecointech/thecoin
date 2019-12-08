import React, { useCallback } from "react"
import { Dropdown, DropdownItemProps } from "semantic-ui-react"
import { NavLink } from "react-router-dom"
import { selectActiveAccount } from "containers/Accounts/Selectors"
import { selectAccounts } from "@the-coin/components/containers/Account/selector"
import { DispatchAccounts } from "containers/Accounts/Reducer"
import { useDispatch } from "react-redux"
// import { AccountMap } from "@the-coin/components/containers/Account/types"


// const isLoggedIn = (accounts: AccountMap, name: string) =>
//   accounts[name].signer != null;


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
    <Dropdown button text={activeAccount} id='createAccountHeader'>
      <Dropdown.Menu>
        <Dropdown.Header>My Account</Dropdown.Header>
        <Dropdown.Item text='Settings' description='' as={NavLink} to="/accounts/addAccount" />
        <Dropdown.Item text='Sign Out' description='' as={NavLink} to="/accounts/signout" />
        <Dropdown.Divider />
        {allNames
          .filter(account => account != activeAccount)
          .map(name => <Dropdown.Item key={name} text={name} account={name} description='' onClick={doSetActive} to="/accounts/" />)
        }
        <Dropdown.Divider />
        <Dropdown.Item text='Remove Accounts' description='' as={NavLink} to="/accounts/removeAll" />
        <Dropdown.Divider />
        <Dropdown.Item text='Privacy Policy' />
      </Dropdown.Menu>
    </Dropdown>
  )
}
