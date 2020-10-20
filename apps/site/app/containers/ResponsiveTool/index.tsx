import { createMedia } from "@artsy/fresnel";

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
