import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import illustrationPeople from './images/illust_grow.svg';
import illustrationPlant from './images/illust_flowers.svg';

import styles from './styles.module.less';
import { CreateAccountButton } from '../../components/AppLinks/CreateAccount';

export enum TypeCreateAccountBanner {
    People,
    Plants
}

export type Props = {
    Type: TypeCreateAccountBanner;
}

const title = { id:"site.createAccountBanner.title",
                defaultMessage:"The benefits of a chequing, savings, and investing account all in one!",
                description:"The benefits of a chequing, savings, and investing account all in one!"};

export const CreateAccountBanner = (props: Props) => {

    let illustration = illustrationPlant;
    if (props.Type === 0) {
        illustration = illustrationPeople;
    }
   return (
        <Grid className={ `${styles.content} x20spaceBefore` } id={styles.createAccountBanner} columns='equal' textAlign='center' verticalAlign='middle' stackable>
            <Grid.Row>
                <Grid.Column>
                    <Header as='h3'>
                        <FormattedMessage {...title} />
                    </Header>
                    <CreateAccountButton size='large' />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column textAlign='left'>
                    <img src={ illustration } />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
