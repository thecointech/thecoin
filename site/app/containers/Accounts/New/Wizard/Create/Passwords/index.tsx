import React from 'react';
import { Step, Icon, Button, Header, List, Confirm } from 'semantic-ui-react';
import { PageProps } from '../PageProps';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

export const CreatePasswordStep = () => (
  <>
    <Icon name="key" />
    <Step.Content>
    <Step.Title><FormattedMessage {...messages.stepHeader} /></Step.Title>
      <Step.Description><FormattedMessage {...messages.stepSubHeader} /></Step.Description>
    </Step.Content>
  </>
);

export const CreatePasswordPage = (props: PageProps) => {
  const [complete, setComplete] = React.useState(false);
  const [doConfirm, setConfirm] = React.useState(false);
  const setCompleteCB = React.useCallback(() => {
    setComplete(true);
  }, []);

  const onClickNext = React.useCallback(() => {
    if (!complete) {
      setConfirm(true);
      return;
    }
    props.onComplete();
  }, []);

  const onConfirmCancel = React.useCallback(() => setConfirm(false), []);
  const onConfirmOk = React.useCallback(() => props.onComplete(), []);

  const buttonText = complete ? props.buttonText : 'SKIP';

  return (
    <>
    <Header as="h1">
      <Header.Content>
        <FormattedMessage {...messages.header} />
      </Header.Content>
      <Header.Subheader>
        <FormattedMessage {...messages.subHeader} />
      </Header.Subheader>
    </Header>
    <p>
      <FormattedMessage {...messages.para1} />
      <a href="https://blog.preempt.com/weak-passwords" target="_blank">
        <FormattedMessage {...messages.para1Link} />
      </a>
    </p>
    <p>
      <FormattedMessage {...messages.para2} />
    </p>
    <List divided relaxed verticalAlign="middle">
      <List.Item>
        <List.Content>
          <FormattedMessage {...messages.masterPassword} />
          <ul>
            <li><a>https://www.useapassphrase.com</a></li>
          </ul>
          <FormattedMessage {...messages.setMasterPwd} />
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <FormattedMessage {...messages.passwordManagers} />
          <ul>
            <li><a href="https://www.lastpass.com" onClick={setCompleteCB} target="_blank">LastPass</a> (Free - iOS, Android; Chrome plugin works on Windows, Mac, Linux)</li>
            <li><a href="https://1password.com" onClick={setCompleteCB} target="_blank">1 Password</a> (Paid - Windows, Mac, iOS, Android)</li>
            <li><a href="https://keepass.info"  onClick={setCompleteCB} target="_blank">KeePass</a> (Free - Linux, Windows, Mac, Android)</li>
          </ul>
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <FormattedMessage {...messages.usePasswordGenerator} />
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <FormattedMessage {...messages.profit} />
        </List.Content>
      </List.Item>
    </List>
    <Button onClick={onClickNext}>{buttonText}</Button>
    <Confirm open={doConfirm}
      header="Warning: Are you sure you want to skip this?"
      content="You didn't click on any links, and we just want to check that you really did mean to skip.  If you already have a password manager, we apologise, but if you don't it only takes a few minutes to setup, and it makes your account so very much safer."
      onCancel={onConfirmCancel} onConfirm={onConfirmOk} />
  </>
  );
};
