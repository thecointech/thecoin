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
  return (
    <Container>
      <div>
        <Button as={NavLink} to={createUrl} content='I want to create an account with The Coin' secondary size='massive' style={{ width: '400px' }} />
      </div>
      <div>
        <Button as={NavLink} to={existingUrl} right content='I have an account with The Coin' secondary size='massive' style={{ width: '400px' }} />
      </div>
    </Container>
  )
}