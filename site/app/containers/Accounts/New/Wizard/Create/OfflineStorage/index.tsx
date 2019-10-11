import React, { useState } from 'react';
import { GetStoredWallet } from '@the-coin/components/containers/Account/storageSync';
import { Step, Header, Button, Image, List, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { PageProps } from '../PageProps';
import messages from './messages';
import Vault from './vault.svg';
import styles from './index.module.css';
import QRCode from 'qrcode';
import { Download } from 'containers/Accounts/Settings/download';

export const OfflineStorageStep = () => (
  <>
    <Image className={styles.LogoBlack} src={Vault} avatar circular />
    <Step.Content>
      <Step.Title><FormattedMessage {...messages.stepHeader} /></Step.Title>
      <Step.Description><FormattedMessage {...messages.stepSubHeader} /></Step.Description>
    </Step.Content>
  </>
);

function printWallet(printWindow: Window | null, accountName: string) {
  accountName = 'some file';
  const wallet = GetStoredWallet(accountName);
  if (printWindow == null) {
    alert('Please allow popups');
    return false;
  }

  printWindow.document.body.innerHTML = '<canvas id="canvas"></canvas>';
  const canvas = printWindow.document.getElementById('canvas');
  const accountString = JSON.stringify(wallet);
  QRCode.toCanvas(canvas, accountString, (error) => {
    if (error) { console.error(error); }
    console.log('success!');
  });

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
  return true;
}

export const OfflineStoragePage = (props: PageProps) => {
  const [done, setDone] = useState(false);
  const setDoneCB = React.useCallback(() => {
    setDone(true);
  }, []);
  // tslint:disable: jsx-no-lambda
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
      </p>
      <p>
        <FormattedMessage {...messages.para2} />
      </p>
      <p/>
      <List celled verticalAlign="middle">
        <List.Item>
          <List.Content floated="right">
            <Button onClick={() => {
              // tslint:disable-next-line: max-line-length
              const printWindow = window.open('', props.accountName, 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=780,top=' + (screen.height - 200) + ',left=' + (screen.width - 200));
              if (printWallet(printWindow, props.accountName)) {
                setDone(true);
              }
            }}>
              <FormattedMessage {...messages.printButton} />
            </Button>
          </List.Content>
          <Icon name="print" />
          <List.Content>
            <FormattedMessage {...messages.printMessage} />
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content floated="right">
            <Download accountName={props.accountName} onComplete={setDoneCB} />
          </List.Content>
          <Icon name="download" />
          <List.Content>
            <FormattedMessage {...messages.downloadMessage} />
          </List.Content>
        </List.Item>
        </List>




      <Button disabled={!done} onClick={props.onComplete}>{props.buttonText}</Button>
    </>
  );
};
