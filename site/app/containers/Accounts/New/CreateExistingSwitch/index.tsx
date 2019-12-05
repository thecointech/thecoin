import React from 'react';
import { Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from 'utils/detection';

type Props = {
  url: string
}
export const CreateExistingSwitch = (props: Props) => {

  const {url} = props;
  const doConnect = isWeb3Enabled();
  const createUrl = doConnect
    ? `${url}connect/`
    : `${url}generate/`

  const existingUrl = doConnect
    ? `${url}connect/`
    : `${url}generate/`
  return (
    <>
      <div>
        <Button as={NavLink} to={createUrl} content='I want to create an account with The Coin' primary size='massive' style={{ width: '400px' }} />
      </div>
      <div>
        <Button as={NavLink} to={existingUrl} content='I have an account with The Coin' secondary size='massive' style={{ width: '400px' }} />
      </div>
    </>
  )
}