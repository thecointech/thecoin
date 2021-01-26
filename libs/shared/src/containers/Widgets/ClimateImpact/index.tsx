import React from "react";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

/*const options = [
  { key: 1, class: 'EN', toTranslate: "en" },
  { key: 2, class: 'FR', toTranslate: "fr" },
  { key: 3, class: 'FR', toTranslate: "fr" },
  { key: 4, class: 'FR', toTranslate: "fr" },
];*/
export type Props = {
  Mobile: boolean;
}


export const ClimateImpact = (props:Props) => {
  let classForContainer = "";
  if (props.Mobile === true){
    classForContainer = styles.mobile;
  }
  //const { locale } = useSelector(selectLocale);
  return (
    <div className={ `${styles.climateImpact} ${classForContainer} ${styles.water}` }>
        <Header as="h5">
            Climate Impact
        </Header>
        <Header as="h3">
            80
        </Header> &nbsp;
        <Header as="h4">
            Trees
        </Header>
        <br  />
        Some text here maybe
    </div>
  )
}
