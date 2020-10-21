import { createMedia } from "@artsy/fresnel";
import React from "react";
import { Segment } from "semantic-ui-react";

export const appMedia = createMedia({
    breakpoints: {
      mobile: 320,
      tablet: 768,
      computer: 992,
      largeScreen: 1200,
      widescreen: 1920
    }
  });
export const mediaStyles = appMedia.createMediaStyle();
  
export const { Media, MediaContextProvider } = appMedia;

export const MobileSegment : React.FC = (props) =>
  <Segment as={Media} at="mobile">{props.children}</Segment>;

export const LargerThanMobileSegment : React.FC = (props) => 
  <Segment as={Media} largerThan="mobile" >{props.children}</Segment>; 

