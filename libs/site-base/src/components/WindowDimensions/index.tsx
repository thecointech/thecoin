import { breakpointsValues } from 'components/ResponsiveTool';
import { useState, useEffect } from 'react';

function getWindowDimensions() {
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
