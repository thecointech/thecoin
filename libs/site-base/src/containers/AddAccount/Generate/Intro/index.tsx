import React, { useState } from "react";
import { Header, Grid, Container, List } from "semantic-ui-react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Link } from "react-router";

import styles from './styles.module.less';
import { Decoration } from "../../Decoration";
import { ButtonPrimary } from "../../../../components/Buttons";
import { ModalOperation } from "@thecointech/shared/containers/ModalOperation";
import { usePreserveQuery } from "containers/AddAccount/utils";

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'WHY ARE WE DIFFERRENT?',
      description: 'app.account.generate.aboveTheTitle: The above the title for the information page before the create account form'},
  title : {
      defaultMessage: 'Welcome to TheCoin',
      description: 'app.account.generate.title: Title for the information page before the create account form'},
  description : {
      defaultMessage: 'Accounts with TheCoin are a little different to your regular bank. We are built on the blockchain, which means that we don\'t store your account keys - you do! If you\'ve never used a blockchain account, some of these differences can seem a bit strange. We encourage you to read the short intro articles below if you would like to learn more.',
      description: 'app.account.generate.description: Title for the information page before the create account form'},
  buttonGoodPass : {
      defaultMessage: 'How to make a good password',
      description: 'app.account.generate.button.goodPassword: button for the information page before the create account form'},
  buttonAccountStored : {
      defaultMessage: 'Where is my account stored?',
      description: 'app.account.generate.button.accountStored: button for the information page before the create account form'},
  proud : {
      defaultMessage: 'We are very proud to combine the cutting-edge security and  performance of blockchain with the the conveniences of traditional banking.',
      description: 'app.account.generate.proud: Text underneath the buttons for the information page before the create account form'},
  buttonGo : {
      defaultMessage: 'Create a New Account',
      description: 'app.account.generate.button.go: The create account button for the information page before the create account form'},
  passwordTextCaracters : {
      defaultMessage: 'Eight characters should be the minimum.',
      description: 'app.account.generate.passwordTextCaracters: The text for the create your password text'},
  passwordTextCase : {
      defaultMessage: 'Your password should have lowercase, uppercase, numbers, letters, typographic signs.',
      description: 'app.account.generate.passwordTextCase: The text for the create your password text'},
  passwordTextNames : {
      defaultMessage: 'Avoid words like your name, your location, your family name or your pet’s name.',
      description: 'app.account.generate.passwordTextNames: The text for the create your password text'},
  passwordTextUnique : {
      defaultMessage: 'Use a unique password.',
      description: 'app.account.generate.passwordTextUnique: The text for the create your password text'},
  passwordTextKeep : {
      defaultMessage: 'Never give your password to anyone.',
      description: 'app.account.generate.passwordTextKeep: The text for the create your password text'},
  storeAccountText : {
      defaultMessage: 'We employ a multi-layered approach to ensure your account has complete security. Your account and it\'s value are secured on the blockchain, meaning that the same security that protects over $17 trillion of assets also protects your account. This security is, in practical terms, unhackable.',
      description: 'app.account.generate.storeAccountText: The text for the create your password text'}
});

export const Intro = () => {
  const nextStep = usePreserveQuery('/addAccount/generate');

  const [passwordTextVisibility, setPasswordTextVisibility] = useState(false);
  const [accountTextVisibility, setAccountTextVisibility] = useState(false);
  return (
    <Container className={`${styles.content} x8spaceBefore `}>
      <Header as='h5'>
        <FormattedMessage {...translations.aboveTheTitle} />
      </Header>
      <Header as="h2">
          <FormattedMessage {...translations.title} />
      </Header>
        <p><FormattedMessage {...translations.description} />
        </p>
        <Grid columns='equal'>
          <Grid.Row>
            <Grid.Column >
              <a onClick={() => setPasswordTextVisibility(true)}>
                <FormattedMessage {...translations.buttonGoodPass} />
              </a>
            </Grid.Column>
            <Grid.Column>
              <a onClick={() => setAccountTextVisibility(true)}>
                <FormattedMessage {...translations.buttonAccountStored} />
              </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <p className={ `x4spaceBefore` }>
          <FormattedMessage {...translations.proud} />
        </p>
      <ButtonPrimary as={Link} to={nextStep} size="medium" className={ `x4spaceBefore` }>
        <FormattedMessage {...translations.buttonGo} />
      </ButtonPrimary>
      <Decoration />


      <ModalOperation
        isOpen={passwordTextVisibility}
        header={translations.buttonGoodPass}
        closeIconFct={() => setPasswordTextVisibility(false)}
      >
        <List bulleted>
          <List.Item><FormattedMessage {...translations.passwordTextCaracters} /></List.Item>
          <List.Item><FormattedMessage {...translations.passwordTextCase} /></List.Item>
          <List.Item><FormattedMessage {...translations.passwordTextNames} /></List.Item>
          <List.Item><FormattedMessage {...translations.passwordTextUnique} /></List.Item>
          <List.Item><FormattedMessage {...translations.passwordTextKeep} /></List.Item>
        </List>
      </ModalOperation>

      <ModalOperation
        isOpen={accountTextVisibility}
        header={translations.buttonAccountStored}
        closeIconFct={() => setAccountTextVisibility(false)}
      >
        <FormattedMessage {...translations.storeAccountText} />
      </ModalOperation>


    </Container>
  )
}
