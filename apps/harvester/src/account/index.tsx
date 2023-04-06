import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { UploadData } from '@thecointech/shared/containers/UploadWallet';
import { useEffect } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { Step } from 'semantic-ui-react';
import { getData, Key } from '../Training/data';
import { AccountRouter } from './routes'

export const Account = () => {

  const location = useLocation();
  const navigation = useHistory();
  const active = AccountMap.useActive();
  const all = AccountMap.useData();
  const api = AccountMap.useApi();
  const stored = getData(Key.wallet);

  useEffect(() => {
    if (!active && stored) {
      const storedWallet = JSON.parse(stored) as UploadData;
      api.addAccount(storedWallet.name, storedWallet.wallet.address, storedWallet.wallet);
      api.setActiveAccount(storedWallet.wallet.address);
      navigation.push('/account/login');
    }
  }, []);
  const isUploaded = !!active;
  const isLoggedIn = !!active?.contract;
  const hasPlugins = !!active?.plugins.length;
  return (
    <div>
      <Step.Group ordered>
        <AccountStep
          title="Load Account"
          description="Upload the wallet to harvest into"
          completed={isUploaded}
          to="/account/upload"
          pathname={location.pathname} />
        <AccountStep
          title="Login"
          description="Give access to the account"
          completed={isLoggedIn}
          to="/account/login"
          disabled={!isUploaded}
          pathname={location.pathname} />
        <AccountStep
          title="Plugins"
          description="Add functionality required"
          completed={hasPlugins}
          to="/account/plugins"
          disabled={!isLoggedIn}
          pathname={location.pathname} />
      </Step.Group>
      <div>
        All Accounts:
        <ul>
          {Object.keys(all.map).map(a => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <Link to="/account/upload">Upload yes</Link>
      </div>
      <AccountRouter account={active} />
    </div>
  )
}

type AccountStepProps = {
  title: string
  description: string
  completed: boolean
  to: string
  pathname: string
  disabled?: boolean
}
const AccountStep = (p: AccountStepProps) => (
  <Step as={Link} completed={p.completed} disabled={p.disabled} to={p.to} active={p.pathname == p.to}>
    <Step.Content>
      <Step.Title>{p.title}</Step.Title>
      <Step.Description>{p.description}</Step.Description>
    </Step.Content>
  </Step>
)
