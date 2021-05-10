import React, { FunctionComponent } from 'react';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { CopyToClipboard } from '@thecointech/site-base/components/CopyToClipboard';
import { Grid } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

interface Props {
  xferRecipient?: string;
  xferSecret?: string;
  showDlg: boolean;
  onCloseDlg: () => void;
}

const getTransferCodeHeader = { id:"app.accounts.purchase.getTransferCodeHeader",
                defaultMessage:"Please wait..."};
const haveTransferCodeHeader = { id:"app.accounts.purchase.haveTransferCodeHeader",
                defaultMessage:"Your details:" };
const fetchTransferCode = { id:"app.accounts.purchase.fetchTransferCode",
                defaultMessage:"We are generating your individual e-Transfer recipient info"};
const yourTransferCode = { id:"app.accounts.purchase.yourTransferCode",
                defaultMessage:"The following is your personalized e-Transfer info:" };
const yourTransferRecipient = { id:"app.accounts.purchase.yourTransferRecipient",
                defaultMessage:"Recipient:"};
const yourTransferSecret = { id:"app.accounts.purchase.yourTransferSecret",
                defaultMessage:"Secret:" };

export const ETransferModal: FunctionComponent<Props> = (props: Props) =>
{
  const {xferRecipient, xferSecret} = props;
  return (xferSecret && xferRecipient) ?
  (
    <ModalOperation
      isOpen={props.showDlg}
      header={haveTransferCodeHeader}
      okCallback={props.onCloseDlg}
      progressPercent={1}
    >
      <Grid>
        <Grid.Row>
          <FormattedMessage {...yourTransferCode} />
        </Grid.Row>
        <Grid.Row columns="two">
          <Grid.Column className={styles.fixedColumn}>
            <FormattedMessage {...yourTransferRecipient} />
          </Grid.Column>
          <Grid.Column className={styles.floatColumn}>
          <CopyToClipboard payload={xferRecipient}>
            {xferRecipient+ " "}
          </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns="two">
          <Grid.Column className={styles.fixedColumn}>
            <FormattedMessage {...yourTransferSecret} />
          </Grid.Column>
          <Grid.Column className={styles.floatColumn}>
            <CopyToClipboard payload={xferSecret}>
              {xferSecret+ " "}
            </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </ModalOperation>
  ) : (
    <ModalOperation
      isOpen={props.showDlg}
      header={getTransferCodeHeader}
      okCallback={props.onCloseDlg}
    >
      <FormattedMessage {...fetchTransferCode} />
    </ModalOperation>
  )
}
