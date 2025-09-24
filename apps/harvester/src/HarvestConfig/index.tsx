//import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';
import { PathSteps, PathRouter, PathNextButton } from '@/SimplePath';
import { path } from './routes';

export const HarvestConfig = () => {

  ConfigReducer.useStore();

  return (
    <div>
      <PathSteps path={path} data={{}}/>
      <div>
        <PathRouter path={path} />
        <PathNextButton path={path} />
      </div>
    </div>
  )
}
