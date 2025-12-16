import React from 'react';

import { CreateAccountBanner, TypeCreateAccountBanner } from '../CreateAccountBanner';
import { GreaterThanMobileSegment, MobileSegment, breakpointsValues } from '@thecointech/media-context';

import { Grid, Header, StrictGridColumnProps } from 'semantic-ui-react';
import { ColumnWithTwoTitles } from './ColumnWithTwoTitles';
import { defineMessages, FormattedMessage } from 'react-intl';

import illustration from './images/healthier-illustration.svg';

import illustrationLeft from './images/illust_graph_left.svg';
import illustrationRight from './images/illust_graph_right.svg';

import { useWindowDimensions } from '@thecointech/shared/components/WindowDimensions';

import styles from './styles.module.less';

const translations = defineMessages({
  title : {
    defaultMessage: 'Earth’s Healthier',
    description: 'site.healthier.title: Main title for the Earth’s Healthier page'},
  description : {
    defaultMessage: 'Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account.',
    description: 'site.healthier.description: Description underneath the title for the Earth’s Healthier page'},
  majorBanks : {
    defaultMessage: 'The major banks take an average of $1000 in profits each year from every Canadian.',
    description: 'site.healthier.majorbanks: text for the banks taking money for the Earth’s Healthier page'},
  investments : {
    defaultMessage: 'We invest our clients’ accounts and give them 90% of the profit.',
    description: 'site.healthier.invest: text for the investment part for the Earth’s Healthier page'},
  lifestyle : {
      defaultMessage: 'It only costs about $100 per person to offset the CO2 for our current lifestyle.',
      description: 'site.healthier.lifestyle: text for the lifestyle part for the Earth’s Healthier page'},
  carbon : {
      defaultMessage: 'The remaining 1/10th is used to pay off our carbon debt',
      description: 'site.healthier.carbon: text for the carbon debt part for the Earth’s Healthier page'}
});

const styleLeft: React.CSSProperties = {
  float: 'left',
  left: '0px',
};

const styleRight: React.CSSProperties = {
  float: 'right',
  right: '0px',
};

export function Healthier() {

  const windowDimension = useWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;

  let cssForSeparatorRight: React.CSSProperties|undefined = undefined;
  let cssForSeparatorLeft: React.CSSProperties|undefined = undefined;
  let textAligntValueRight = "left";
  let textAligntValueLeft = "left";

  // If Small Screen / Mobile
  if (windowDimension.width <= breakpointTablet){
    cssForSeparatorRight = styleRight;
    cssForSeparatorLeft = styleLeft;
    textAligntValueRight = "right";
    textAligntValueLeft = "left";
  }

  return (
    <>
      <div className={ `${styles.wrapper} x10spaceBefore x20spaceAfter` }>
        <GreaterThanMobileSegment>
          <img src={illustration} className={styles.illustration} />
        </GreaterThanMobileSegment>
        <MobileSegment>
          <img src={illustrationRight} className={styles.illustrationRight} />
        </MobileSegment>
          <Grid id={ `${styles.healthierContent}` } columns='equal' textAlign='left' verticalAlign='top' stackable>
            <Header as="h2" className={ `x2spaceBefore` }>
                <FormattedMessage {...translations.title} />
                <Header.Subheader className={`x5spaceBefore`}>
                  <FormattedMessage  {...translations.description} />
                </Header.Subheader>
            </Header>
            <Grid.Row className={ `${styles.numberContent}` }>
              <Grid.Column textAlign={textAligntValueLeft as StrictGridColumnProps["textAlign"]}>
                <ColumnWithTwoTitles
                  FirstTitle = "$1000"
                  FirstHeaderMessage = { translations.majorBanks }
                  SecondTitle= "90%"
                  SecondHeaderMessage = { translations.investments }
                  CssForSeparator = { cssForSeparatorLeft } />
              </Grid.Column>
              <Grid.Column className={styles.rightColumn} textAlign={textAligntValueRight as StrictGridColumnProps["textAlign"]}>
                <ColumnWithTwoTitles
                    FirstTitle = "$100"
                    FirstHeaderMessage = { translations.lifestyle }
                    SecondTitle= "1/10"
                    SecondHeaderMessage = { translations.carbon }
                    CssForSeparator = { cssForSeparatorRight }/>
                </Grid.Column>
            </Grid.Row>
          </Grid>
        <MobileSegment>
          <img src={illustrationLeft} className={styles.illustrationLeft} />
        </MobileSegment>
      </div>
      <CreateAccountBanner Type={ TypeCreateAccountBanner.People } />
    </>
  );
}
