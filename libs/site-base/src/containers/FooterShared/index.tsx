import React from 'react';

import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, StrictGridColumnProps } from 'semantic-ui-react';

import facebook from './images/facebook.svg';
import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';
import { useWindowDimensions } from '@thecointech/shared/components/WindowDimensions';
import { breakpointsValues } from '@thecointech/shared/components/ResponsiveTool';

const translate = defineMessages({ 
    registered : { id:"dsfs", defaultMessage:"The Coin Collaborative Canada is a registered non-profit",
            description:"base.footer.registered.Registered Non profit phrase in footer"},
    copyright : { id:"ssfdsf", defaultMessage:"Copyright 2020. TheCoin. All Right Reserved.",
                description:"base.footer.copyright: Copyright phrase in footer"}});

export const FooterShared = () => {

  const windowDimension = useWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;
  const registeredContent = <FormattedMessage {...translate.registered} />;
  const socialLinksContent = <><a href="https://www.facebook.com/TheCoinCollaborative/" target="_blank"><img src={facebook} /></a><img src={twitter} /><img src={instagram} /></>;
  const copyrightContent = <>&#169; &nbsp;<FormattedMessage {...translate.copyright} /></>;

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
      <Grid columns='equal' centered verticalAlign='top' stackable className={ `x0spaceBefore` }>
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
