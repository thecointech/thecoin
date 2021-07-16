import React from 'react'
import { FormattedMessage, MessageDescriptor } from 'react-intl'
import { Header } from 'semantic-ui-react';
import styles from './styles.module.less';

type Props = {
  above: MessageDescriptor;
  title: MessageDescriptor;
}

export const PageHeader = ({ above, title }: Props) => (
  <div id={styles.header}>
    <Header as="h5" className={styles.above}>
      <FormattedMessage {...above} />
    </Header>
    <Header as={'h3'} className={styles.title}>
      <FormattedMessage {...title} />
    </Header>
  </div>
)
