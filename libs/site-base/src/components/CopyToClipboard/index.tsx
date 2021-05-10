import React, { FunctionComponent, useState } from 'react';
import {Clipboard} from 'ts-clipboard';
import { Icon, Popup } from 'semantic-ui-react';
import styles from './styles.module.less';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

interface Props {
  payload: string;
  label?: MessageDescriptor;
}

const link = { id:"base.copyToClipboard.link",
                defaultMessage:"Copy",
                description:"Link for the button for the copy to clipboard tool" };
const messageSuccess = { id:"base.copyToClipboard.messageSuccess",
                defaultMessage:"Copied to your clipboard",
                description:"Success message for the button for the copy to clipboard tool" };

export const CopyToClipboard: FunctionComponent<Props> = (props) => {

  const intl = useIntl();
  const [open, setOpen] = useState(false)
  const copyLabel = props.label ? props.label : link;

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    Clipboard.copy(props.payload);
    event.stopPropagation();
  };

  return (
    <>
      {
        (props.children) ?
          <a onClick={onClick} className={styles.Link}>{props.children}</a> :
          undefined
      }
      <Popup
        content={intl.formatMessage(messageSuccess)}
        on='click'
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        position='left center'
        trigger={
          <span className={styles.Link} onClick={onClick}>
            <Icon name="copy" />
            <FormattedMessage {...copyLabel} />
          </span>}
      />
    </>
  );
};
