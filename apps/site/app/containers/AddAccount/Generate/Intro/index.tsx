import React from "react";
import { Header, Button, Grid, Container } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import styles from './styles.module.css';
import { Decoration } from "components/Decoration";


export const Intro = () => {
  return (
    <Container className={styles.content}>

      <Header as='h5'>
        <FormattedMessage 
          id="site.account.generate.aboveTheTitle"
          defaultMessage="WHY ARE WE DIFFERRENT?"
          description="Description for the information page before the create account form"
            />
      </Header>
      <Header as="h2">
          <FormattedMessage 
            id="site.account.generate.header"
            defaultMessage="Welcome to TheCoin"
            description="Title for the information page before the create account form"
             />
      </Header>
        <p><FormattedMessage 
            id="site.account.generate.info"
            defaultMessage="Accounts with TheCoin are a little different to your regular bank. We are built on the blockchain, which means that we don't store your account keys - you do!
              If you've never used a blockchain account, some of these differences can seem a bit strange. We encourage you to read the short intro articles below if you would like to learn more."
            description="Content for the information page before the create account form"
              />
        </p>
        <Grid columns='equal'>
          <Grid.Row>
            <Grid.Column>
              <Link to="/FAQ/my-account" target="_blank">
                <FormattedMessage 
                  id="site.account.generate.button.goodPassword"
                  defaultMessage="How to make a good password"
                  description="Description for the information page before the create account form"
                    />
                </Link>
            </Grid.Column>
            <Grid.Column>
              <Link to="/FAQ/my-account" target="_blank">
                <FormattedMessage 
                  id="site.account.generate.button.accountStored"
                  defaultMessage="Where is my account stored?"
                  description="Description for the information page before the create account form"
                    />
                </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <p>
          <FormattedMessage 
                id="site.account.generate.proud"
                defaultMessage="We are very proud to combine the cutting-edge security and  performance of blockchain\
                with the the conveniences of traditional banking."
                description="Text underneath the buttons for the information page before the create account form"
            />
        </p>
      <Button as={Link} to="/addAccount/generate" primary size="huge">
        <FormattedMessage 
                id="site.account.generate.button.go"
                defaultMessage="Create a New Account"
                description="The create account button for the information page before the create account form"
            />
      </Button>
      <Decoration />
    </Container>
  )
}