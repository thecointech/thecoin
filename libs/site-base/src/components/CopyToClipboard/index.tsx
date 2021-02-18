import React, { useState, FunctionComponent } from 'react';
import {Clipboard} from 'ts-clipboard';
import { Icon, Message } from 'semantic-ui-react';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';

interface Props {
  payload: string;
}

const link = { id:"base.copyToClipboard.link",
                defaultMessage:"Copy",
                description:"Link for the button for the copy to clipboard tool" };
const messageSuccess = { id:"base.copyToClipboard.messageSuccess",
                defaultMessage:"Copied to your clipboard",
                description:"Success message for the button for the copy to clipboard tool" };

export const CopyToClipboard: FunctionComponent<Props> = (props) => {

  const [className, setClassName] = useState(styles.ToastBox);
  const [timeout, setTimeoutCB] = useState(0);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    Clipboard.copy(props.payload);
    setClassName(styles.ShowToastBox);
    if (timeout) {
      window.clearTimeout(timeout);
    }
    const newTimeout = window.setTimeout(() => {
      setClassName(styles.ToastBox);
    }, 1500);
    setTimeoutCB(newTimeout);
    event.stopPropagation();
  };

  return (
    <>
    {
      (props.children) ?
        <a onClick={onClick} className={styles.Link}>{props.children}</a> :
        undefined
    }
      <Message as="span" floating className={className}>
        <FormattedMessage {...messageSuccess} />
      </Message>
      <span className={styles.Link} onClick={onClick}>
        <Icon name="copy" />
        <FormattedMessage {...link} />
      </span>
    </>
  );
};
