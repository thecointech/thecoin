import React from "react";

import thecoin01 from './images/user_avatar01.svg';
import thecoin02 from './images/user_avatar02.svg';
import thecoin03 from './images/user_avatar03.svg';
import thecoin04 from './images/user_avatar04.svg';
import thecoin05 from './images/user_avatar05.svg';
import thecoin06 from './images/user_avatar06.svg';
import thecoin07 from './images/user_avatar07.svg';
import thecoin08 from './images/user_avatar08.svg';
import thecoin09 from './images/user_avatar09.svg';
import thecoin10 from './images/user_avatar10.svg';
import thecoin11 from './images/user_avatar11.svg';
import thecoin12 from './images/user_avatar12.svg';
import thecoin13 from './images/user_avatar13.svg';
import thecoin14 from './images/user_avatar14.svg';
import thecoin15 from './images/user_avatar15.svg';
import thecoin16 from './images/user_avatar16.svg';

const avatars = [thecoin01, thecoin02, thecoin03, thecoin04, thecoin05, thecoin06, thecoin07, thecoin08, thecoin09, thecoin10, thecoin11, thecoin12, thecoin13, thecoin14, thecoin15, thecoin16] as const;
type AvatarIdx = keyof Omit<typeof avatars, keyof (string)[]>;

export const Avatars = ({index}: { index: AvatarIdx }) => (
   <div>
        <img src={avatars[index]} title="Avatar"/>
    </div>
  )
