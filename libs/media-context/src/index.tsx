import { createMedia } from "@artsy/fresnel";
import React, { type PropsWithChildren } from "react";
import { Segment } from "semantic-ui-react";

export const breakpointsValues = {
  mobile: 0,
  tablet: 768,
  computer: 1024,
  largeScreen: 1192,
  widescreen: 1920
};


export const { Media, MediaContextProvider, createMediaStyle } = createMedia({
    breakpoints: breakpointsValues
  });
export const mediaStyles = createMediaStyle();

export const MobileSegment = ({children}: PropsWithChildren<{}>) =>
  <Segment as={Media} at="mobile">{children}</Segment>;

type Props = {
  className?: string;
}
export const GreaterThanMobileSegment = ({children, className}: PropsWithChildren<Props>) =>
  <Segment as={Media} className={className} greaterThan="mobile">{children}</Segment>;

