import React from 'react';
import { Header, Divider } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from '@the-coin/shared/utils/detection';
import styles from './styles.module.less';
import { Decoration } from 'components/Decoration';
import { FormattedMessage } from 'react-intl';
import { ButtonPrimary, ButtonSecondary } from '@the-coin/site-base/components/Buttons';

type Props = {
  url: string
}

const aboveTheTitle = { id:"app.account.create.aboveTheTitle",
                defaultMessage:"First Step",
                description:"Title above the main Title for the create account form page"};
const title = { id:"app.account.create.title",
                defaultMessage:"Create your account",
                description:"Title for the create account form page"};
const buttonNewAccount = {  id:"app.account.create.button.newAccount",
                            defaultMessage:"I want to create a new Account",
                            description:"Button redirect people to create a new account on the let's get started page"};
const buttonAccount = { id:"app.account.create.button.account",
                        defaultMessage:"I already have an Account",
                        description:"Button redirect people to connect their existing account on the let's get started page"};

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
          <FormattedMessage {...aboveTheTitle} />
        </Header>
        <Header as="h1" className={` x12spaceAfter`}>
          <FormattedMessage {...title} />
        </Header>
        <ButtonPrimary as={NavLink} to={createUrl} className={styles.button}>
          <FormattedMessage {...buttonNewAccount} />
        </ButtonPrimary>
        <Divider horizontal>Or</Divider>
        <ButtonSecondary as={NavLink} to={existingUrl} className={styles.button}>
          <FormattedMessage {...buttonAccount} />  
        </ButtonSecondary>
      </div>
      <Decoration />
    </>
  )
}
