import React from 'react';
import { Button, Container } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from 'utils/detection';

type Props = {
  url: string
}
export const CreateExistingSwitch = (props: Props) => {

  const {url} = props;
  const doConnect = isWeb3Enabled();
  const createUrl = doConnect
    ? `${url}/connect/create`
    : `${url}generate/`

  const existingUrl = doConnect
    ? `${url}connect/exist`
    : `${url}restore/`

    const connectOtherAccount = `${url}connect/exist`;
  return (
    <Container id="accountUserChoiceStep1">
      <div id="">
        <Button as={NavLink} to={createUrl} content='I want to create a new Account' secondary style={{ width: '250px' }} />
        <Button as={NavLink} to={existingUrl} content='I already have an Account' primary style={{ width: '250px' }} />
        <Button as={NavLink} disabled={!doConnect} to={connectOtherAccount} content='I want to connect my existing ETH Account' primary style={{ width: '250px' }} />
      </div>
    </Container>
  )
}