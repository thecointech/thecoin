import * as React from 'react';
import verifiedIcon from '../images/verified_yes_icon.svg';
import styles from './styles.module.less';

type VisualProps={
    avatar: string,
    verified: boolean,
};

export const ContactAvatar = (props:VisualProps) => {
  const avatar = props.avatar;
  const verified = props.verified ? <img src={verifiedIcon} title={"Verified"} /> : "";
  return (
    <div>
      <div className={styles.contactusVerified}>
          {verified}
      </div>
      <div className={styles.contactusAvatar}>
          <img src={avatar} title={"Avatar"} />
      </div>
    </div>
  );
}