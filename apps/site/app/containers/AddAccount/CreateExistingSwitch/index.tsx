import React from 'react';
import { Button, Header, Divider } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from 'utils/detection';
import styles from './styles.module.css';

type Props = {
  url: string
}
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
    <div id={styles.buttonsContainer}>
      <Header as="h1">
        <Header.Content>
          Lets Get Started
        </Header.Content>
        <Header.Subheader>
        </Header.Subheader>
      </Header>
      <Button as={NavLink} to={createUrl} content='I want to create a new Account' secondary className={styles.button}/>
      <Divider horizontal>Or</Divider>
      <Button as={NavLink} to={existingUrl} content='I already have an Account' primary className={styles.button}/>
    </div>
  )
}
