import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

//TODO: replace by the real graph
import Graph from './images/Group576.svg';

const translations = defineMessages({
  title : {
      defaultMessage: 'Your possible benefits',
      description: 'site.compare.graph.title: Graph title for the How much will you make? graph page'},
  description : {
    defaultMessage: 'Your chequing account will be with you longer than your retirement savings will. This is what that could look like.',
    description: 'site.compare.graph.description: Graph description for the How much will you make? graph page'}
  });

type Props = {
  initial: number,
  income: number,
  creditSpend: number,
  cashSpend: number,
  annualSpend: number,
  duration: number,
}
export const GraphCompare = (props: Props) => {

    return (
      <div className={styles.graphContainer}>
          <Header as="h4">
            <FormattedMessage {...translations.title} />
          </Header>
          <FormattedMessage {...translations.description} />
          <img src={Graph} />
      </div>
    );
};
