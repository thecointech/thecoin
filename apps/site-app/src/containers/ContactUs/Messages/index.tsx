import * as React from 'react';

import { ContactAvatar, TheCoinAvatar } from '../Avatars';

import styles from './styles.module.less';

export const UserMessage = () => {
  return (
    <div className={styles.userMessageContainer}>
      <div className={ `${styles.contactMessageLine} x4spaceBefore` }>
        <div>
          TEST
        <div className={styles.infosRight}>you - 2 days ago</div>
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
        <div className={ `${styles.contactAvatarLine} xspaceAfter ${styles.answer}` }>
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

