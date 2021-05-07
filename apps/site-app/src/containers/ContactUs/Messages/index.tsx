import * as React from 'react';
import { ContactAvatar } from '../Avatars';
import styles from './styles.module.less';

type VisualProps={
  message: string, 
  messageComplement: string,

  contactAvatar: string,
  contactVerified: boolean,
};

export const UserMessage = (props: VisualProps) => {
  return (
    <div className={styles.userMessageContainer}>
      <div className={ `${styles.contactMessageLine} x4spaceBefore` }>
        <div>
          <span className={styles.message}>{props.message}</span>
        <div className={styles.infosRight}>{props.messageComplement}</div>
        </div>
      </div>
        <div className={styles.contactAvatarLine}>
          <ContactAvatar 
            avatar={props.contactAvatar} 
            verified={props.contactVerified} 
          />
        </div>
    </div>
  );     
}

export const Answer = (props: VisualProps) => {
  return (
    <div>
      <div className={styles.contactAnswerLine}>
        <div className={ `${styles.contactAvatarLine} x2spaceAfter ${styles.answer}` }>
          <ContactAvatar 
            avatar={props.contactAvatar} 
            verified={props.contactVerified} 
          />
        </div>
        <div className={styles.messageZone}>
          <span className={styles.message}>{props.message}</span>
          <div className={styles.infosRight}>{props.messageComplement}</div>
        </div>
      </div>
    </div>
  );     
}

