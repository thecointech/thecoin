//import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';
import { PathSteps, PathRouter, PathNextButton } from '@/SimplePath';
import { path } from './routes';
import { ContentSection } from '@/ContentSection';

export const HarvestConfig = () => {

  ConfigReducer.useStore();
  const data = ConfigReducer.useData();

  return (
    <div>
      <PathSteps path={path} data={data}/>
      <ContentSection>
        <PathRouter path={path} />
        <PathNextButton path={path} />
      </ContentSection>
    </div>
  )
}
