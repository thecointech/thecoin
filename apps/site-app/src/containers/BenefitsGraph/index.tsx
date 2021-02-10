import * as React from 'react';
import { Header } from 'semantic-ui-react';
import styles from "./styles.module.less";


export const BenefitsGraph = () => {

  return (
    <React.Fragment>
        <div className={ ` ${styles.graphBackground}` }>
          <Header as="h5">
            Graph
          </Header>
        </div>
    </React.Fragment>
  );
}

