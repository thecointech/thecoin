import { BankConnectReducer } from './state/reducer'
import { useBankConnectPaths } from './routes'
import { SimplePath } from '@/SimplePath';
export { path } from './routes';

export const BankConnect = () => {
  BankConnectReducer.useStore();
  const paths = useBankConnectPaths();
  const data = BankConnectReducer.useData();

  return (
    <SimplePath path={paths} data={data} />
  )
}
