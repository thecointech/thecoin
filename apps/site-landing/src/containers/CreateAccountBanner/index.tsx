import * as React from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Header } from 'semantic-ui-react';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../components/AppLinks/CreateAccount';

export enum TypeCreateAccountBanner {
    People,
    Plants
}

const bgStyles = {
  [TypeCreateAccountBanner.People]: styles.withPeople,
  [TypeCreateAccountBanner.Plants]: styles.withPlants,
}

export type Props = {
  Type: TypeCreateAccountBanner;
  className?: string;
}

const title = defineMessage({
  defaultMessage: 'Not a solution. A choice. Yours.',
  description: 'the sites closing argument'
});

export const CreateAccountBanner = (props: Props) => (
  <div className={`${styles.content} ${bgStyles[props.Type]} ${props.className ?? ''}`} >
    <Header as='h3' className={styles.title}>
      <FormattedMessage {...title} />
    </Header>
    <CreateAccountButton size='large' />
  </div>
);
