import * as React from 'react';

import verified from '../images/verified_yes_icon.svg';
import styles from './styles.module.less';
import { getAvatarLink } from '@thecointech/shared/components/Avatars';

//type VisualProps={
//    errorMessage: MessageDescriptor
//};
  

export const ContactAvatar = () => {
  const avatar= getAvatarLink("14");
  return (
    <div>
      <div className={styles.contactusVerified}>
          <img src={verified} title={"Verified"} />
      </div>
      <div className={styles.contactusAvatar}>
          <img src={avatar} title={"Avatar"} />
      </div>
    </div>
  );
}