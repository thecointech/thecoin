import React from "react";
import { FormattedMessage } from "react-intl";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

const title = {
  id: "shared.widgets.climateimpact.title",
  defaultMessage: "Climate Impact",
  description: "Title for the Widget Climate impact in the app"
};

const waterUnity = {
  id: "shared.widgets.climateimpact.waterUnity",
  defaultMessage: "litres",
  description: "Text for the Widget Climate impact in the app"
};
const waterText = {
  id: "shared.widgets.climateimpact.waterText",
  defaultMessage: "of water was cleaned thanks to you",
  description: "Text for the Widget Climate impact in the app"
};
const windUnity = {
  id: "shared.widgets.climateimpact.windUnity",
  defaultMessage: "tonns",
  description: "Text for the Widget Climate impact in the app"
};
const windText = {
  id: "shared.widgets.climateimpact.windText",
  defaultMessage: "of CO2 offseted thanks to you",
  description: "Text for the Widget Climate impact in the app"
};
const earthUnity = {
  id: "shared.widgets.climateimpact.earthUnity",
  defaultMessage: "tonns",
  description: "Text for the Widget Climate impact in the app"
};
const earthText = {
  id: "shared.widgets.climateimpact.earthText",
  defaultMessage: "of CO2 offseted thanks to you",
  description: "Text for the Widget Climate impact in the app"
};
const treesUnity = {
  id: "shared.widgets.climateimpact.treesUnity",
  defaultMessage: "trees",
  description: "Text for the Widget Climate impact in the app"
};
const treesText = {
  id: "shared.widgets.climateimpact.treesText",
  defaultMessage: "were planted thanks to you",
  description: "Text for the Widget Climate impact in the app"
};
const farmUnity = {
  id: "shared.widgets.climateimpact.farmUnity",
  defaultMessage: "trees",
  description: "Text for the Widget Climate impact in the app"
};
const farmText = {
  id: "shared.widgets.climateimpact.farmText",
  defaultMessage: "were planted thanks to you",
  description: "Text for the Widget Climate impact in the app"
};

const options = [
  { key: 'water', class: styles.water, unityToTranslate: waterUnity ,textToTranslate: waterText },
  { key: 'wind', class: styles.wind, unityToTranslate: windUnity ,textToTranslate: windText },
  { key: 'earth', class: styles.earth, unityToTranslate: earthUnity ,textToTranslate: earthText },
  { key: 'trees', class: styles.trees, unityToTranslate: treesUnity ,textToTranslate: treesText },
  { key: 'farm', class: styles.farm, unityToTranslate: farmUnity ,textToTranslate: farmText },
];

export const ClimateImpact = () => {
  const quantity = 80;
  var randomItem = options[Math.floor(Math.random()*options.length)];
  return (
    <div className={ `${styles.climateImpact} ${randomItem.class}` }>  
      <Header as="h5">
        <FormattedMessage {...title} />
      </Header>
      <div className={styles.textZone}>
        <Header as="h3">
            {quantity}
        </Header> &nbsp;
        <Header as="h4">
          <FormattedMessage {...randomItem.unityToTranslate} />
        </Header>
        <br  />
        <FormattedMessage {...randomItem.textToTranslate} />
      </div>
      <div className={styles.decoration}></div>
    </div>
  )
}
