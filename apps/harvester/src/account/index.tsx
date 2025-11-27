import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useAccountPath } from './routes'
import { SimplePath } from '@/SimplePath';
export { path } from './routes';

export const Account = () => {

  const path = useAccountPath();
  const accounts = AccountMap.useData();
  // Don't call useActive directly, as it will always
  // return an account if it can (even if active is set to null)
  const active = accounts.map[accounts.active ?? ""];

  return <SimplePath path={path} data={active} />
}
