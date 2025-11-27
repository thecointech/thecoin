import React from 'react';
import { Header, Divider } from 'semantic-ui-react';
import { Link, NavLink } from 'react-router';
import styles from './styles.module.less';
import { Decoration } from '../Decoration';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ButtonPrimary, ButtonSecondary } from '../../../components/Buttons';

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'First Step',
      description: 'app.account.create.aboveTheTitle: Title above the main Title for the create account form page'},
  title : {
      defaultMessage: 'Create your account',
      description: 'app.account.create.title: Title for the create account form page'},
  buttonNewAccount : {
      defaultMessage: 'I want to create a new Account',
      description: 'app.account.create.button.newAccount: Button redirect people to create a new account on the let\'s get started page'},
  buttonAccount : {
      defaultMessage: 'I already have an Account',
      description: 'app.account.create.button.account: Button redirect people to connect their existing account on the let\'s get started page'},
  ethereumExistingAccount : {
      defaultMessage: 'You can also log into your TheCoin account using an existing Ethereum account.',
      description: 'app.account.create.ethereum: link redirect people to connect their existing eth account'},
  ethereumNewAccount : {
      defaultMessage: 'You can create a new TheCoin account using an existing Ethereum account.',
      description: 'app.account.create.ethereum: link redirect people to connect their existing eth account'}
});

export const CreateExistingSwitch = () => {
  return (
    <>
      <div id={ `${styles.buttonsContainer}` }>
        <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...translations.aboveTheTitle} />
        </Header>
        <Header as="h1" className={` x12spaceAfter`}>
          <FormattedMessage {...translations.title} />
        </Header>
        <ButtonPrimary as={NavLink} to="./generate/intro" className={styles.button}>
          <FormattedMessage {...translations.buttonNewAccount} />
        </ButtonPrimary>
        <Divider horizontal>Or</Divider>
        <ButtonSecondary as={NavLink} to="./restore/" className={styles.button}>
          <FormattedMessage {...translations.buttonAccount} />
        </ButtonSecondary>
        <div className={`x8spaceBefore`}>
            <Link className={styles.linkEthereum} to="./connect/create">
              <FormattedMessage {...translations.ethereumNewAccount} />
            </Link>
        </div>
        <div>
            <Link className={styles.linkEthereum} to="./connect/exist">
              <FormattedMessage {...translations.ethereumExistingAccount} />
            </Link>
        </div>
      </div>
      <Decoration />
    </>
  )
}
