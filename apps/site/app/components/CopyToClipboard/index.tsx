import React, { useState, FunctionComponent } from 'react';
import {Clipboard} from 'ts-clipboard';
import { Icon, Message } from 'semantic-ui-react';
import styles from './styles.module.less';

interface Props {
  payload: string;
}

export const CopyToClipboard: FunctionComponent<Props> = (props) => {

  const [className, setClassName] = useState(styles.ToastBox);
  const [timeout, setTimeoutCB] = useState(0);

  const onClick = () => {
    Clipboard.copy(props.payload);
    setClassName(styles.ShowToastBox);
    if (timeout) {
      window.clearTimeout(timeout);
    }
    const newTimeout = window.setTimeout(() => {
      setClassName(styles.ToastBox);
    }, 1500);
    setTimeoutCB(newTimeout);
    return false;
  };

  return (
    <>
    {
      (props.children) ?
        <a onClick={onClick} className={styles.Link}>{props.children}</a> :
        undefined
    }
      <Message as="span" floating className={className}>Link Copied</Message>
      <Icon name="copy" onClick={onClick} />
    </>
  );
};
