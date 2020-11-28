import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header, Button } from 'semantic-ui-react';
import illustrationPeople from './images/illust_grow.svg';
import illustrationPlant from './images/illust_flowers.svg';

import styles from './styles.module.css';
import { NavLink } from 'react-router-dom';

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

const buttonCreate = { id:"site.createAccountBanner.button", 
                        defaultMessage:"Create Account",
                        description:"Create Account button for the create account banner for interior pages"};

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
                    <Button as={NavLink} to="/addAccount" content='' primary size='massive' >
                        <FormattedMessage {...buttonCreate} />
                    </Button>
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
