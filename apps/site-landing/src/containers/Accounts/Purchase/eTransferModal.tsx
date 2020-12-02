import React, { FunctionComponent } from 'react';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { CopyToClipboard } from '@the-coin/site-base/components/CopyToClipboard';
import { Grid } from 'semantic-ui-react';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

interface Props {
  xferRecipient?: string;
  xferSecret?: string;
  showDlg: boolean;
  onCloseDlg: () => void;
}

export const ETransferModal: FunctionComponent<Props> = (props: Props) =>
{
  const {xferRecipient, xferSecret} = props;
  return (xferSecret && xferRecipient) ?
  (
    <ModalOperation
      isOpen={props.showDlg}
      header={messages.haveTransferCodeHeader}
      okCallback={props.onCloseDlg}
      progressPercent={1}
    >
      <Grid>
        <Grid.Row>
          <FormattedMessage {...messages.yourTransferCode} />
        </Grid.Row>
        <Grid.Row columns="two">
          <Grid.Column className={styles.fixedColumn}>
            <FormattedMessage {...messages.yourTransferRecipient} />
          </Grid.Column>
          <Grid.Column className={styles.floatColumn}>
          <CopyToClipboard payload={xferRecipient}>
            {xferRecipient+ " "}
          </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns="two">
          <Grid.Column className={styles.fixedColumn}>
            <FormattedMessage {...messages.yourTransferSecret} />
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
      header={messages.getTransferCodeHeader}
      okCallback={props.onCloseDlg}
    >
      <FormattedMessage {...messages.fetchTransferCode} />
    </ModalOperation>
  )
}
