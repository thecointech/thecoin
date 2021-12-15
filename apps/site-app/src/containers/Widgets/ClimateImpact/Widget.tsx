import React from "react";
import { AvailableSoon } from "@thecointech/shared/containers/Widgets/AvailableSoon";
import styles from "./Visual/styles.module.less";
import { Visual } from "./Visual/index";
import { defineMessages } from "react-intl";

const translate = defineMessages({
  title : {
    id: "shared.widgets.climateimpact.title",
    defaultMessage: "Climate Impact",
    description: "shared.widgets.climateimpact.title: Title for the Widget Climate impact in the app"},
  waterUnity : {
    id: "shared.widgets.climateimpact.waterUnity",
    defaultMessage: "litres",
    description: "shared.widgets.climateimpact.waterUnity: Text for the Widget Climate impact in the app"},
  waterText : {
    id: "shared.widgets.climateimpact.waterText",
    defaultMessage: "of water was cleaned thanks to you",
    description: "shared.widgets.climateimpact.waterText: Text for the Widget Climate impact in the app"},
  windUnity : {
    id: "shared.widgets.climateimpact.windUnity",
    defaultMessage: "tonnes",
    description: "shared.widgets.climateimpact.windUnity: Text for the Widget Climate impact in the app"},
  windText : {
    id: "shared.widgets.climateimpact.windText",
    defaultMessage: "of CO2 offseted thanks to you",
    description: "shared.widgets.climateimpact.windText: Text for the Widget Climate impact in the app"},
  earthUnity : {
    id: "shared.widgets.climateimpact.earthUnity",
    defaultMessage: "tonns",
    description: "shared.widgets.climateimpact.earthUnity: Text for the Widget Climate impact in the app"},
  earthText : {
    id: "shared.widgets.climateimpact.earthText",
    defaultMessage: "of CO2 offseted thanks to you",
    description: "shared.widgets.climateimpact.earthText: Text for the Widget Climate impact in the app"},
  treesUnity : {
    id: "shared.widgets.climateimpact.treesUnity",
    defaultMessage: "trees",
    description: "shared.widgets.climateimpact.treesUnity: Text for the Widget Climate impact in the app"},
  treesText : {
    id: "shared.widgets.climateimpact.treesText",
    defaultMessage: "were planted thanks to you",
    description: "shared.widgets.climateimpact.treesText: Text for the Widget Climate impact in the app"},
  farmUnity : {
    id: "shared.widgets.climateimpact.farmUnity",
    defaultMessage: "trees",
    description: "shared.widgets.climateimpact.farmUnity: Text for the Widget Climate impact in the app"},
  farmText : {
    id: "shared.widgets.climateimpact.farmText",
    defaultMessage: "were planted thanks to you",
    description: "shared.widgets.climateimpact.farmText: Text for the Widget Climate impact in the app"}});

export const options = [
  { key: 'water', class: styles.water, unityToTranslate: translate.waterUnity, textToTranslate: translate.waterText },
  { key: 'wind', class: styles.wind, unityToTranslate: translate.windUnity, textToTranslate: translate.windText },
  { key: 'earth', class: styles.earth, unityToTranslate: translate.earthUnity, textToTranslate: translate.earthText },
  { key: 'trees', class: styles.trees, unityToTranslate: translate.treesUnity, textToTranslate: translate.treesText },
  { key: 'farm', class: styles.farm, unityToTranslate: translate.farmUnity, textToTranslate: translate.farmText },
];

export const ClimateImpact = () => {
  const quantity = "80";
  const randomItem = options[Math.floor(Math.random()*options.length)];
  return (
    <AvailableSoon fill={true}>
      <Visual title={translate.title} quantity={quantity} item={randomItem} />
    </AvailableSoon>
  )
}
