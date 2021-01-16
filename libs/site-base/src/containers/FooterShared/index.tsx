import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Grid, StrictGridColumnProps } from 'semantic-ui-react';

import facebook from './images/facebook.svg';
import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';
import getWindowDimensions from '../../components/WindowDimensions';
import { breakpointsValues } from '../../components/ResponsiveTool';


const registered = {  id:"base.footer.registered",
                      defaultMessage:"The Coin Collaborative Canada is a registered non-profit",
                      description:"Registered Non profit phrase in footer"};

const copyright = {   id:"base.footer.copyright",
                      defaultMessage:"Copyright 2020. TheCoin. All Right Reserved.",
                      description:"Copyright phrase in footer"};


export const FooterShared = () => {

  const windowDimension = getWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;
  const registeredContent = <FormattedMessage {...registered} />;
  const socialLinksContent = <><img src={facebook} /><img src={twitter} /><img src={instagram} /></>;
  const copyrightContent = <>&#169; &nbsp;<FormattedMessage {...copyright} /></>;

  let alignForLeftColumn = "left" ;
  let alignForCenterColumn = "center";
  let alignForRightColumn = "right";
  let leftColumn = registeredContent;
  let centerColumn = socialLinksContent;
  let rightColumn = copyrightContent;

  // If Small Screen / Mobile
  if (windowDimension.width <= breakpointTablet){
    alignForLeftColumn = "center";
    alignForCenterColumn = "center";
    alignForRightColumn = "center";
    leftColumn = socialLinksContent;
    centerColumn = registeredContent;
    rightColumn = copyrightContent;
  }

  return (
    <>
      <Grid columns='equal' centered verticalAlign='top' stackable className={ `x2spaceBefore` }>
        <Grid.Row>
          <Grid.Column textAlign={alignForLeftColumn as StrictGridColumnProps["textAlign"]}>
            {leftColumn}
          </Grid.Column>
          <Grid.Column textAlign={alignForCenterColumn as StrictGridColumnProps["textAlign"]}>
            {centerColumn}
          </Grid.Column>
          <Grid.Column textAlign={alignForRightColumn as StrictGridColumnProps["textAlign"]}>
            {rightColumn}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}