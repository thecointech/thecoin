import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { StartingValueLine } from './StartingValueLine';
import { DurationLine } from './DurationLine';

import styles from './styles.module.less';

export const FormCompare = () => {

    return (
      <div id={styles.variablesContainer}>

        <StartingValueLine />
        <DurationLine />

        <Button secondary className={styles.buttonContainer}>
          <FormattedMessage id="site.compare.button"
                            defaultMessage="Show Me"
                            description="Button for the graph page" />
        </Button>
      </div>
    );
};
