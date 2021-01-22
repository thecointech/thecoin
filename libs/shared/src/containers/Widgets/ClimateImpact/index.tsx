import React from "react";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

/*const options = [
  { key: 1, class: 'EN', toTranslate: "en" },
  { key: 2, class: 'FR', toTranslate: "fr" },
  { key: 3, class: 'FR', toTranslate: "fr" },
  { key: 4, class: 'FR', toTranslate: "fr" },
];*/

export const ClimateImpact = () => {
  //const { locale } = useSelector(selectLocale);
  return (
    <div className={ `${styles.climateImpact} ${styles.wind}` }>
        <Header as="h5">
            Climate Impact
        </Header>
    </div>
  )
}
