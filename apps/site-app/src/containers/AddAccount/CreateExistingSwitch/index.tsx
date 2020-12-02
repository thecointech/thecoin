import React from 'react';
import { Button, Header, Divider } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { isWeb3Enabled } from '@the-coin/shared/utils/detection';
import styles from './styles.module.less';
import { Decoration } from 'components/Decoration';

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
    <>
      <div id={ `${styles.buttonsContainer}` } className={` x4spaceBefore `}>
        <Header as="h1" className={` x8spaceAfter `}>
            Lets Get Started
        </Header>
        <Button as={NavLink} to={createUrl} content='I want to create a new Account' secondary className={styles.button}/>
        <Divider horizontal>Or</Divider>
        <Button as={NavLink} to={existingUrl} content='I already have an Account' primary className={styles.button}/>
      </div>
      <Decoration />
    </>
  )
}
