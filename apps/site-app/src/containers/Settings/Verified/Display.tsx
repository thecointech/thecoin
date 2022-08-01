import React from 'react'
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react'
import styles from './styles.module.less';

type DisplayProps = {
  data: {
    title: MessageDescriptor;
    description: MessageDescriptor;
    icon: string;
  },
  button: React.ReactElement,
}

export const AccountVerifyDisplay = ({ data, button }: DisplayProps) => (
  <div className={styles.containerVerify}>
    <Grid stackable>
        <Grid.Row >
            <Grid.Column width={2} verticalAlign='middle' textAlign='center'><img src={data.icon} /></Grid.Column>
            <Grid.Column width={10}>
                <Header as="h5">
                    <FormattedMessage {...data.title} />
                </Header>
                <FormattedMessage {...data.description} />
            </Grid.Column>
            <Grid.Column width={4} verticalAlign='middle' textAlign='center'>
              {button}
            </Grid.Column>
        </Grid.Row>
    </Grid>
  </div>
)
