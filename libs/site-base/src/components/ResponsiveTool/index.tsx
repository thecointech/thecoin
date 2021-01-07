import { createMedia } from "@artsy/fresnel";
import React from "react";
import { Segment } from "semantic-ui-react";
import { useState, useEffect } from 'react';

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

// When we use at=mobile it will use whatever is in the segments and apply that to the dimensions between mobile and tablet
export const MobileSegment : React.FC = (props) =>
  <Segment as={Media} at="mobile">{props.children}</Segment>;

export const GreaterThanMobileSegment : React.FC = (props) => 
  <Segment as={Media} greaterThan="mobile">{props.children}</Segment>; 


export function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }
  
  export function isMobile(){
    const windowDimension = getWindowDimensions();
    const breakpointTablet = breakpointsValues.tablet;
    // If Small Screen / Mobile
    if (windowDimension.width <= breakpointTablet){
      return true;
    }
    return false;
  }
  
  export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return windowDimensions;
  }
