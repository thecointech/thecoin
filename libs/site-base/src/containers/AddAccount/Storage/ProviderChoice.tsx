import React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router-dom';
import { Header } from 'semantic-ui-react';
import styles from './styles.module.less';

type Props = {
  link?: string,
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  imgSrc: string,
  txt: MessageDescriptor
}

export const ProviderChoice = ({onClick, link, imgSrc, txt}: Props) =>
  <div className={styles.choice} >
    <Link to={link ?? ((v) => v)} onClick={onClick}>
      <img src={imgSrc} />
      <Header as={"h4"}><FormattedMessage {...txt} /></Header>
    </Link>
  </div>
