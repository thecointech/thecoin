import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import * as React from 'react';
import coin from '../images/thecoin_icon.svg';
import { ContactAvatar } from '../Avatars';

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
          <ContactAvatar 
            avatar={getAvatarLink("14")} 
            verified={true} 
          />
        </div>
    </div>
  );     
}

export const Answer = () => {
  return (
    <div>
      <div className={styles.contactAnswerLine}>
        <div className={ `${styles.contactAvatarLine} x2spaceAfter ${styles.answer}` }>
          <ContactAvatar 
            avatar={coin} 
            verified={true} 
          />
        </div>
        <div className={styles.messageZone}>
            TEST
          <div className={styles.infosRight}>you - 2 days ago</div>
        </div>
      </div>
    </div>
  );     
}

