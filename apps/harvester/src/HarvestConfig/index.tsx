//import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';
import { PathSteps, PathRouter, PathNextButton } from '@/SimplePath';
import { path } from './routes';
import { ContentSection } from '@/ContentSection';
import { usePathIndex } from '@/SimplePath/types';

export const HarvestConfig = () => {

  ConfigReducer.useStore();
  const data = ConfigReducer.useData();

  const index = usePathIndex();

  return (
    <div>
      <PathSteps path={path} data={data}/>
      <ContentSection>
        <PathRouter path={path} />
        { index < path.routes.length - 1 && <PathNextButton />}
      </ContentSection>
    </div>
  )
}
