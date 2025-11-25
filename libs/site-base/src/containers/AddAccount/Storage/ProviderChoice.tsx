import React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router';
import { Loader, Header, Dimmer } from 'semantic-ui-react'
import styles from './styles.module.less';

type Props = {
  disabled?: boolean;
  loading?: boolean;
  link?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  imgSrc: string;
  txt: MessageDescriptor;
}

export const ProviderChoice = ({ loading, onClick, link, imgSrc, txt }: Props) =>
  <div className={styles.choice} >
    <Dimmer active={loading} inverted>
      <Loader inverted>Loading</Loader>
    </Dimmer>
    {link && (
      <Link to={link} onClick={onClick} >
        <img src={imgSrc} />
        <Header as={"h4"}><FormattedMessage {...txt} /></Header>
      </Link>
    )}
  </div>
