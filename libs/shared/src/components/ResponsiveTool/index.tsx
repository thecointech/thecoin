import { createMedia } from "@artsy/fresnel";
import React from "react";
import { Segment } from "semantic-ui-react";

export const breakpointsValues = {
  mobile: 0,
  tablet: 768,
  computer: 1024,
  largeScreen: 1192,
  widescreen: 1920
};


export const appMedia = createMedia({
    breakpoints: breakpointsValues
  });
export const mediaStyles = appMedia.createMediaStyle();

export const { Media, MediaContextProvider } = appMedia;

export const MobileSegment : React.FC = (props) =>
  <Segment as={Media} at="mobile">{props.children}</Segment>;

type Props = {
  className?: string;
}
export const GreaterThanMobileSegment : React.FC<Props> = (props) =>
  <Segment as={Media} className={props.className} greaterThan="mobile">{props.children}</Segment>;

