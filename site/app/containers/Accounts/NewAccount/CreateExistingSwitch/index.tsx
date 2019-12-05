import React from 'react';
import { Button, Container, Header, Divider } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from 'utils/detection';

type Props = {
  url: string
}
export const CreateExistingSwitch = (props: Props) => {

  const {url} = props;
  const doConnect = isWeb3Enabled();
  /*const createUrl = doConnect
    ? `${url}connect/create`
    : `${url}generate/`
    : `${url}generate/`*/

  const existingUrl = doConnect
    ? `${url}connect/exist`
    : `${url}restore/`

  const existingWeb3 = doConnect
  ? `Your browser has a compatible account, would you like to connect to it?`
  : `We haven't detected a compatible account. Come back here with Opera.`

  const connectOtherAccount = `${url}connect/exist`;
  const createNewAccount = `${url}generate`;

  return (
    <Container id="accountUserChoiceStep1">
      <Header as="h1">
        <Header.Content>
        </Header.Content>
        <Header.Subheader>
        </Header.Subheader>
      </Header>
      <div id="accountUserChoiceStep1Buttons">
        <Button as={NavLink} to={createNewAccount} content='I want to create a new The Coin Account' secondary style={{ width: '300px', marginLeft: '7%' }} />
        <Button as={NavLink} to={existingUrl} content='I already have a The Coin Account' primary style={{ width: '300px', marginLeft: '7%'  }} />
        <br />
        <Divider horizontal>Or</Divider>
        {existingWeb3}
        <Button as={NavLink} disabled={!doConnect} to={connectOtherAccount} content='I want to connect my existing ETH Account' primary style={{ width: '300px', marginLeft: '7%' }} />
      </div>
    </Container>
  )
}