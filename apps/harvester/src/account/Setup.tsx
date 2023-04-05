import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Login } from './Login';
import { Plugins } from './Plugins';
import { Upload } from './Upload';

export const SetupAccount = () => {
  const active = AccountMap.useActive();
  return (
    !active
    ? <Upload />
    : (active.contract == null)
      ? <div><Login {...active} /></div>
      : <div><Plugins /></div>
  );
}
