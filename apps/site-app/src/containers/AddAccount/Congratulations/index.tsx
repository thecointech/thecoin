import React from "react"
import { FormattedMessage } from "react-intl"
import { Link } from "react-router-dom";
import { Header, Container, Button, Grid } from "semantic-ui-react";
import Confetti from 'react-confetti';
import styles from './styles.module.less';
import illustration from './images/illust_congrats.svg';
import { Decoration } from "components/Decoration";


const aboveTheTitle = { id:"site.Account.create.congratulations.aboveTheTitle",
                        defaultMessage:"Your Account has been created",
                        description:"Title above the title for the congratulations page"};
const title = { id:"site.Account.create.congratulations.title",
                defaultMessage:"Congratulations!",
                description:"Title for the congratulations page"};
const description = {   id:"site.Account.create.congratulations.description",
                        defaultMessage:"Now you are ready to get started with TheCoin. Top up your balance to start get benefits and make the future a better place.",
                        description:"The description for the congratulations page"};
const goToAccount = {   id:"site.Account.create.congratulations.button.goToAccount",
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
            <Grid stackable centered textAlign='center' verticalAlign='middle' columns='equal'>
                <Grid.Row centered>
                    <Grid.Column centered textAlign='center' verticalAlign='middle' >
                        <Header as="h5">
                            <FormattedMessage {...aboveTheTitle} />
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <Grid.Column centered textAlign='center' verticalAlign='middle' >
                        <Header as="h1">
                            <FormattedMessage {...title} />
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <Grid.Column centered textAlign='center' verticalAlign='middle' >
                        <img src={illustration} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <Grid.Column centered textAlign='center' verticalAlign='middle' >
                        <FormattedMessage {...description} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <Grid.Column centered textAlign='center' verticalAlign='middle' >
                        <Button as={Link} to="/accounts" primary size="big">
                            <FormattedMessage {...goToAccount} />
                        </Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Decoration />
        </div>
    </Container>
  );
}
