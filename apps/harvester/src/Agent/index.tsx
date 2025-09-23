import { PathNextButton, PathRouter, PathSteps } from '../SimplePath'
import { BankConnectReducer } from './state/reducer'
import { useBankConnectPaths } from './routes'


export const BankConnect = () => {
  BankConnectReducer.useStore();
  const paths = useBankConnectPaths();
  const data = BankConnectReducer.useData();

  return (
    <div>
      <PathSteps path={paths} data={data} />
      <div>
        <PathRouter path={paths} />
        <PathNextButton path={paths} />
      </div>
    </div>
  )
}
