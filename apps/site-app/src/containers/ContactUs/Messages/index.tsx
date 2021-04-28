import * as React from 'react';
import illustration from './images/icon_contact_big.svg';
import {AppContainerWithShadow} from 'components/AppContainers';

import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContactForm } from './Form';
import { useState } from 'react';
import { ContactAvatar, TheCoinAvatar } from './Avatars';

import styles from './styles.module.less';

export const UserMessage = () => {
  return (
    <div>
      <div className={ `${styles.contactMessageLine} x6spaceBefore` }>
        <div>
          TEST
        <div>you - 2 days ago</div>
        </div>
        </div>
        <div className={styles.contactAvatarLine}>
          <ContactAvatar />
        </div>
    </div>
  );     
}

export const Answer = () => {
  return (
    <div>
      <div className={styles.contactAnswerLine}>
        <div className={ `${styles.contactAvatarLine} x6spaceAfter ${styles.answer}` }>
          <TheCoinAvatar />
        </div>
        <div className={styles.messageZone}>
            TEST
          <div className={styles.infosRight}>you - 2 days ago</div>
        </div>
      </div>
    </div>
  );     
}

