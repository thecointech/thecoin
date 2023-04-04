import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Login } from './Login';
import { Upload } from './Upload';

export const SetupAccount = () => {
  const active = AccountMap.useActive();
  return (
    !active
    ? <Upload />
    : <div><Login {...active} /></div>
  );
}
