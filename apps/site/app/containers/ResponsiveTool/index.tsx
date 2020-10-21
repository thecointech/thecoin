import { createMedia } from "@artsy/fresnel";
import React, { FC } from "react";
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

export const mobileSegment : FC = (props: {children?: React.ReactNode}) => 
  { 
    return <Segment as {...Media} at="mobile" >{props.children}</Segment>; 
  };
export const largerThanMobileSegment : FC = (props: {children?: React.ReactNode}) =>  
  { 
    return <Segment as {...Media} largerThan="mobile" >{props.children}</Segment>; 
  };