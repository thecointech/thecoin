import React from "react"
import { FormattedMessage } from "react-intl"
import { Link } from "react-router-dom";
import { Header, Container, Grid } from "semantic-ui-react";
import Confetti from 'react-confetti';
import styles from './styles.module.less';
import illustration from './images/illust_congrats.svg';
import { Decoration } from "components/Decoration";
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";


const aboveTheTitle = { id:"app.account.create.congratulations.aboveTheTitle",
                        defaultMessage:"Your Account has been created",
                        description:"Title above the title for the congratulations page"};
const title = { id:"app.account.create.congratulations.title",
                defaultMessage:"Congratulations!",
                description:"Title for the congratulations page"};
const description = {   id:"app.account.create.congratulations.description",
                        defaultMessage:"Now you are ready to get started with TheCoin. Top up your balance to start get benefits and make the future a better place.",
                        description:"The description for the congratulations page"};
const goToAccount = {   id:"app.account.create.congratulations.button.goToAccount",
                        defaultMessage:"Go To Account",
                        description:"The button to be redirected to the account for the congratulations page"};

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
                            <FormattedMessage {...aboveTheTitle} />
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <Header as="h1">
                            <FormattedMessage {...title} />
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
                        <FormattedMessage {...description} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center' verticalAlign='middle' >
                        <ButtonPrimary as={Link} to="/accounts" size="medium">
                            <FormattedMessage {...goToAccount} />
                        </ButtonPrimary>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Decoration />
        </div>
    </Container>
  );
}
