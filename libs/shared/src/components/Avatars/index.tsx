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

type PropsAvatar={
    thecoin: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16";
}

export const Avatars = (props: PropsAvatar) => {
    let avatar = thecoin01;
    switch (props.thecoin) {
        case "02":
            avatar = thecoin02;
            break;
        case "03":
            avatar = thecoin03;
            break;
        case "04":
            avatar = thecoin04;
            break;
        case "05":
            avatar = thecoin05;
            break;
        case "06":
            avatar = thecoin06;
            break;
        case "07":
            avatar = thecoin07;
            break;
        case "08":
            avatar = thecoin08;
            break;
        case "09":
            avatar = thecoin09;
            break;
        case "10":
            avatar = thecoin10;
            break;
        case "11":
            avatar = thecoin11;
            break;
        case "12":
            avatar = thecoin12;
            break;
        case "13":
            avatar = thecoin13;
            break;
        case "14":
            avatar = thecoin14;
            break;
        case "15":
            avatar = thecoin15;
            break;
        case "16":
            avatar = thecoin16;
            break;
        default:
            avatar = thecoin01;
            break
    }
  return (
    <div>
        <img src={avatar} title="Avatar"/>
    </div>
  )
}
