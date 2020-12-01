import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

//TODO: replace by the real graph
import Graph from './images/Group576.svg';

const title = { id:"site.compare.graph.title", 
                defaultMessage:"Your possible benefits",
                description:"Graph title for the How much will you make? graph page"};
const description = { id:"site.compare.graph.description", 
                      defaultMessage:"There is a 95% chance you're return will be in that area.",
                      description:"Graph description for the How much will you make? graph page"};

export const GraphCompare = () => {

    return (
      <div className={styles.graphContainer}>
          <Header as="h4">
            <FormattedMessage {...title} />
          </Header>
          <FormattedMessage {...description} />
                  <br /> <br /> <br /> 
          <img src={Graph} />
      </div>
    );
};
