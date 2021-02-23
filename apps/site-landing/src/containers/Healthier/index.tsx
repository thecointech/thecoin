import * as React from 'react';

import { CreateAccountBanner, TypeCreateAccountBanner } from '../CreateAccountBanner';
import { GreaterThanMobileSegment, MobileSegment, breakpointsValues } from '@the-coin/shared/components/ResponsiveTool';

import { Grid, Header, StrictGridColumnProps } from 'semantic-ui-react';
import { ColumnWithTwoTitles } from './ColumnWithTwoTitles';
import { FormattedMessage } from 'react-intl';

import illustration from './images/healthier-illustration.svg';

import illustrationLeft from './images/illust_graph_left.svg';
import illustrationRight from './images/illust_graph_right.svg';

import { useWindowDimensions } from '@the-coin/shared/components/WindowDimensions';

import styles from './styles.module.less';


const title = { id:"site.healthier.title",
                defaultMessage:"Earth’s Healthier",
                description:"Main title for the Earth’s Healthier page" };
const description = { id:"site.healthier.description",
                      defaultMessage:"Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account.",
                      description:"Description underneath title for the We Do More mobile page" };
const majorBanks = {  id:"site.healthier.majorbanks",
                      defaultMessage:"The major banks take an average of $1000 in profits each year from every Canadian.",
                      description:"The major banks take an average of $1000 in profits each year from every Canadian." };
const investments = { id:"site.healthier.invest",
                      defaultMessage:"We invest our clients’ accounts and give them 90% of the profit.",
                      description:"We invest our clients’ accounts and give them 90% of the profit." };
const lifestyle = {   id:"site.healthier.lifestyle",
                      defaultMessage:"It only costs about $100 per person to offset the CO2 for our current lifestyle.",
                      description:"It only costs about $100 per person to offset the CO2 for our current lifestyle." };
const carbon = {  id:"site.healthier.carbon",
                  defaultMessage:"The remaining 1/10th is used to pay off our carbon debt",
                  description:"The remaining 1/10th is used to pay off our carbon debt" };

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

  let cssForSeparatorRight = undefined;
  let cssForSeparatorLeft = undefined;
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
                <FormattedMessage {...title} />
                <Header.Subheader>
                  <FormattedMessage  {...description} />
                </Header.Subheader>
            </Header>
            <Grid.Row className={ `${styles.numberContent}` }>
              <Grid.Column textAlign={textAligntValueLeft as StrictGridColumnProps["textAlign"]}>
                <ColumnWithTwoTitles
                  FirstTitle = "$1000"
                  FirstHeaderMessage = { majorBanks }
                  SecondTitle= "90%"
                  SecondHeaderMessage = { investments }
                  CssForSeparator = { cssForSeparatorLeft } />
              </Grid.Column>
              <Grid.Column className={styles.rightColumn} textAlign={textAligntValueRight as StrictGridColumnProps["textAlign"]}>
                <ColumnWithTwoTitles
                    FirstTitle = "$100"
                    FirstHeaderMessage = { lifestyle }
                    SecondTitle= "1/10"
                    SecondHeaderMessage = { carbon }
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
