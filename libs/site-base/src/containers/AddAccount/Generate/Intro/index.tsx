import React, { useState } from "react";
import { Header, Grid, Container, List } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import styles from './styles.module.less';
import { Decoration } from "../../Decoration";
import { ButtonPrimary } from "../../../../components/Buttons";
import { ModalOperation } from "@thecointech/shared/containers/ModalOperation";

const aboveTheTitle = { id:"app.account.generate.aboveTheTitle",
                        defaultMessage:"WHY ARE WE DIFFERRENT?",
                        description:"Description for the information page before the create account form"};
const title = { id:"app.account.generate.title",
                defaultMessage:"Welcome to TheCoin",
                description:"Title for the information page before the create account form"};
const description = { id:"app.account.generate.description",
                      defaultMessage:"Accounts with TheCoin are a little different to your regular bank. We are built on the blockchain, which means that we don't store your account keys - you do! If you've never used a blockchain account, some of these differences can seem a bit strange. We encourage you to read the short intro articles below if you would like to learn more.",
                      description:"Description for the information page before the create account form"};
const buttonGoodPass = { id:"app.account.generate.button.goodPassword",
                defaultMessage:"How to make a good password",
                description:"Description for the information page before the create account form"};
const buttonAccountStored = { id:"app.account.generate.button.accountStored",
                defaultMessage:"Where is my account stored?",
                description:"Description for the information page before the create account form"};
const proud = { id:"app.account.generate.proud",
                defaultMessage:"We are very proud to combine the cutting-edge security and  performance of blockchain with the the conveniences of traditional banking.",
                description:"Text underneath the buttons for the information page before the create account form"};
const buttonGo = {  id:"app.account.generate.button.go",
                    defaultMessage:"Create a New Account",
                    description:"The create account button for the information page before the create account form"};

const passwordTextCaracters = { id:"app.account.generate.passwordTextCaracters",
                      defaultMessage:"Eight characters should be the minimum.",
                      description:"The text for the create your password text"};

const passwordTextCase = { id:"app.account.generate.passwordTextCase",
                    defaultMessage:"Your password should have lowercase, uppercase, numbers, letters, typographic signs.",
                    description:"The text for the create your password text"};

const passwordTextNames = { id:"app.account.generate.passwordTextNames",
                    defaultMessage:"Avoid words like your name, your location, your family name or your pet’s name.",
                    description:"The text for the create your password text"};

const passwordTextUnique = { id:"app.account.generate.passwordTextUnique",
                    defaultMessage:"Use a unique password.",
                    description:"The text for the create your password text"};

const passwordTextKeep = { id:"app.account.generate.passwordTextKeep",
                    defaultMessage:"Never give your password to anyone.",
                    description:"The text for the create your password text"};

const storeAccountText = { id:"app.account.generate.storeAccountText",
                      defaultMessage:"We employ a multi-layered approach to ensure your account has complete security. Your account and it's value are secured on the blockchain, meaning that the same security that protects over $17 trillion of assets also protects your account. This security is, in practical terms, unhackable.",
                      description:"The text for the where is my account stored"};

export const Intro = () => {
  const [passwordTextVisibility, setPasswordTextVisibility] = useState(false);
  const [accountTextVisibility, setAccountTextVisibility] = useState(false);
  return (
    <Container className={`${styles.content} x8spaceBefore `}>
      <Header as='h5'>
        <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2">
          <FormattedMessage {...title} />
      </Header>
        <p><FormattedMessage {...description} />
        </p>
        <Grid columns='equal'>
          <Grid.Row>
            <Grid.Column >
              <a onClick={() => setPasswordTextVisibility(true)}>
                <FormattedMessage {...buttonGoodPass} />
              </a>
            </Grid.Column>
            <Grid.Column>
              <a onClick={() => setAccountTextVisibility(true)}>
                <FormattedMessage {...buttonAccountStored} />
              </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <p className={ `x4spaceBefore` }>
          <FormattedMessage {...proud} />
        </p>
      <ButtonPrimary as={Link} to="/addAccount/generate" size="medium" className={ `x4spaceBefore` }>
        <FormattedMessage {...buttonGo} />
      </ButtonPrimary>
      <Decoration />


      <ModalOperation
        isOpen={passwordTextVisibility}
        header={buttonGoodPass}
        closeIconFct={() => setPasswordTextVisibility(false)}
      >
        <List bulleted>
          <List.Item><FormattedMessage {...passwordTextCaracters} /></List.Item>
          <List.Item><FormattedMessage {...passwordTextCase} /></List.Item>
          <List.Item><FormattedMessage {...passwordTextNames} /></List.Item>
          <List.Item><FormattedMessage {...passwordTextUnique} /></List.Item>
          <List.Item><FormattedMessage {...passwordTextKeep} /></List.Item>
        </List>
      </ModalOperation>

      <ModalOperation
        isOpen={accountTextVisibility}
        header={buttonAccountStored}
        closeIconFct={() => setAccountTextVisibility(false)}
      >
        <FormattedMessage {...storeAccountText} />
      </ModalOperation>


    </Container>
  )
}
