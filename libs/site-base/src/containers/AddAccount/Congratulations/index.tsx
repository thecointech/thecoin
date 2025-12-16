import React from "react"
import { defineMessages, FormattedMessage } from "react-intl"
import { Link } from "react-router";
import { Header, Container, Grid } from "semantic-ui-react";
import Confetti from 'react-confetti';
import styles from './styles.module.less';
import illustration from './images/illust_congrats.svg';
import { Decoration } from "../Decoration";
import { ButtonPrimary } from "../../../components/Buttons";

const translations = defineMessages({
    aboveTheTitle : {
        defaultMessage: 'Your Account has been created',
        description: 'app.account.create.congratulations.aboveTheTitle: Title above the title for the congratulations page'},
    title : {
        defaultMessage: 'Congratulations!',
        description: 'app.account.create.congratulations.title: Title for the congratulations page'},
    description : {
        defaultMessage: 'Now you are ready to get started with TheCoin. Top up your balance to start get benefits and make the future a better place.',
        description: 'app.account.create.congratulations.description: The description for the congratulations page'},
    goToAccount : {
        defaultMessage: 'Go To Account',
        description: 'app.account.create.congratulations.button.goToAccount: The button to be redirected to the account for the congratulations page'}
  });

export const Congratulations = () => {
  return (
    <Container>
        <div className={`${styles.content} x6spaceBefore x10spaceAfter` }>
            <Confetti className={styles.confetti}
                width={1000}
                height={800}
                numberOfPieces={50}
                tweenDuration={100}
            />
            <Grid stackable textAlign='center' verticalAlign='middle' columns='equal'>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <Header as="h5">
                            <FormattedMessage {...translations.aboveTheTitle} />
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <Header as="h1">
                            <FormattedMessage {...translations.title} />
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <img src={illustration} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <FormattedMessage {...translations.description} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <ButtonPrimary as={Link} to="/" size="medium">
                            <FormattedMessage {...translations.goToAccount} />
                        </ButtonPrimary>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Decoration />
        </div>
    </Container>
  );
}
