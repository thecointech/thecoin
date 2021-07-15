import React from 'react';
import { Header, Divider } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from '@thecointech/shared/utils/detection';
import styles from './styles.module.less';
import { Decoration } from '../Decoration';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ButtonPrimary, ButtonSecondary } from '@thecointech/site-base/components/Buttons';

type Props = {
  url: string
}

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
      description: 'app.account.create.button.account: Button redirect people to connect their existing account on the let\'s get started page'}
});

export const CreateExistingSwitch = (props: Props) => {

  const {url} = props;
  const doConnect = isWeb3Enabled();
  const createUrl = doConnect
    ? `${url}connect/create`
    : `${url}generate/intro`

  const existingUrl = doConnect
    ? `${url}connect/exist`
    : `${url}restore/`

  return (
    <>
      <div id={ `${styles.buttonsContainer}` }>
        <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...translations.aboveTheTitle} />
        </Header>
        <Header as="h1" className={` x12spaceAfter`}>
          <FormattedMessage {...translations.title} />
        </Header>
        <ButtonPrimary as={NavLink} to={createUrl} className={styles.button}>
          <FormattedMessage {...translations.buttonNewAccount} />
        </ButtonPrimary>
        <Divider horizontal>Or</Divider>
        <ButtonSecondary as={NavLink} to={existingUrl} className={styles.button}>
          <FormattedMessage {...translations.buttonAccount} />
        </ButtonSecondary>
      </div>
      <Decoration />
    </>
  )
}
