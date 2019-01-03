import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import * as styles from './index.module.css';

interface BlurbProps {
  icon: IconProp;
  message: {
    id: string;
  };
}
export default (props: BlurbProps) => (
  <Container textAlign="center">
    <FontAwesomeIcon size="8x" className={styles.blurbIcon} icon={props.icon} />
    <FormattedMessage {...props.message}>
      {(...content) => <div className={styles.blurbText}>{content}</div>}
    </FormattedMessage>
  </Container>
);
