//import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';
import { path } from './routes';
import { SimplePath } from '@/SimplePath';
export { path };

export const HarvestConfig = () => {

  ConfigReducer.useStore();
  const data = ConfigReducer.useData();

  return <SimplePath path={path} data={data} />
    // <div>
    //   {/* <PathSteps path={path} data={data}/> */}
    //   {/* <ContentSection path={path}> */}
    //     {/* <Outlet /> */}
    //     {/* <PathNextButton /> */}
    //   {/* </ContentSection> */}
    // </div>

}
