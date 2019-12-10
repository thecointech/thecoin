import React from 'react';
import { Button, Container, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from 'utils/detection';

type Props = {
  url: string
}
export const CreateExistingSwitch = (props: Props) => {

  const {url} = props;
  const doConnect = isWeb3Enabled();
  const createUrl = doConnect
    ? `${url}connect/create`
    : `${url}generate/`

  const existingUrl = doConnect
    ? `${url}connect/exist`
    : `${url}restore/`

  // const existingWeb3 = doConnect
  // ? `Your browser has a compatible account, would you like to connect to it?`
  // : `We haven't detected a compatible account. Come back here with Opera.`

  // const connectOtherAccount = `${url}connect/exist`;
  // const createNewAccount = `${url}generate`;

  return (
    <Container id="accountUserChoiceStep1">
      <div id="accountUserChoiceStep1Buttons">
        <Header as="h1">
          <Header.Content>
            Lets Get Started
          </Header.Content>
          <Header.Subheader>
          </Header.Subheader>
        </Header>
        <Button as={NavLink} to={createUrl} content='I want to create a new account' secondary style={{ width: '300px', marginLeft: '7%' }} />
        <Button as={NavLink} to={existingUrl} content='I already have an Account' primary style={{ width: '300px', marginLeft: '7%'  }} />
      </div>
    </Container>
  )
}
