import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Icon, Header } from 'semantic-ui-react';
import { CopyToClipboard } from '../../components/CopyToClipboard';
import styles from "./styles.module.less";
import { SidebarHeader as Props } from './types';

export const SidebarHeader = (props: Props) =>
  <div className={styles.headerSidebar}>
    <Header as="h5" className={`appTitles x4spaceBefore`} >
      <FormattedMessage {...props.title} />
    </Header>
    <div className={`${styles.containerAvatar}`}>
      <img className={styles.avatarSidebar} src={props.avatar} />
    </div>
    <div className={`${styles.hozizontalScrollingTextBox} ${styles.primaryDescriptionSidebar}`}>
      <span>{props.accountName}</span>
    </div>
    <Icon name="caret right" disabled size='tiny' id={`${styles.moreToSee}`} />
    <div className={`${styles.secondaryDescriptionSidebar} x2spaceBefore`}>
      <CopyToClipboard payload={props.address!}>
        {props.address}
      </CopyToClipboard>
    </div>
  </div>

