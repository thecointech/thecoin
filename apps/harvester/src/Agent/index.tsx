import { PathNextButton, PathRouter, PathSteps } from '../SimplePath'
import { BankConnectReducer } from './state/reducer'
import { useBankConnectPaths } from './routes'
import { ContentSection } from '@/ContentSection';
import styles from './index.module.less';

export const BankConnect = () => {
  BankConnectReducer.useStore();
  const paths = useBankConnectPaths();
  const data = BankConnectReducer.useData();

  return (
    <div>
      <PathSteps path={paths} data={data} />
      <ContentSection className={styles.container}>
        <PathRouter path={paths} />
        <PathNextButton path={paths} />
      </ContentSection>
    </div>
  )
}
