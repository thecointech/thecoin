import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import coffeePerson from './images/3_illustration.svg';
import startnow from './images/icon3_01.svg';
import investment from './images/icon3_02.svg';
import growth from './images/icon3_03.svg';
import profits from './images/icon3_04.svg';
import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import { Link } from 'react-router-dom';


const title = { id:"site.homepage.wealthier.title",
                defaultMessage:"You’re Wealthier",
                description:"The title for the homepage wealthier"};
const description = { id:"site.homepage.wealthier.description",
                defaultMessage:"Enjoy the benefits of investment growth on every dollar with our online spending account.",
                description:"The description for the homepage wealthier"};

const startnowTitle = { id:"site.homepage.wealthier.startnow.title",
                        defaultMessage:"Start Now",
                        description:"The title for the star now for the homepage wealthier"};
const startnowDescription = { id:"site.homepage.wealthier.startnow.description",
                        defaultMessage:"The most important ingredient is time. You’re young - maximize your benefit!",
                        description:"The description for the star now for the homepage wealthier"};
const startnowLink = { id:"site.homepage.wealthier.startnow.link",
                        defaultMessage:"Learn Your Edge",
                        description:"The link for the star now for the homepage wealthier"};

const investmentTitle = { id:"site.homepage.wealthier.investment.title",
                          defaultMessage:"The Best Investment",
                          description:"The title for the investment for the homepage wealthier"};
const investmentDescription = { id:"site.homepage.wealthier.investment.description",
                                defaultMessage:"Why settle? Our time-tested strategy has the best long-term results.",
                                description:"The description for the investment for the homepage wealthier"};
const investmentLink = {  id:"site.homepage.wealthier.investment.link",
                          defaultMessage:"Compare Us",
                          description:"The link for the investment for the homepage wealthier"};

const growthTitle = { id:"site.homepage.wealthier.growth.title",
                      defaultMessage:"Maximum Growth",
                      description:"The title for the growth for the homepage wealthier"};
const growthDescription = { id:"site.homepage.wealthier.growth.description",
                            defaultMessage:"Add $250000 to your retirement - with no money down.",
                            description:"The description for the growth for the homepage wealthier"};
const growthLink = {  id:"site.homepage.wealthier.growth.link",
                      defaultMessage:"How Anyone Can Get Rich Slow",
                      description:"The link for the growth for the homepage wealthier"};

const profitsTitle = { id:"site.homepage.wealthier.profits.title",
                          defaultMessage:"Keep Your Profits",
                          description:"The title for the profits for the homepage wealthier"};
const profitsDescription = { id:"site.homepage.wealthier.profits.description",
                                defaultMessage:"Every dollar earns every day. As a non-profit, we want you to keep that benefit.",
                                description:"The description for the profits for the homepage wealthier"};
const profitsLink = {  id:"site.homepage.wealthier.profits.link",
                          defaultMessage:"Who Wins?",
                          description:"The link for the profits for the homepage wealthier"};


export const Wealthier = () => {

  return (
    <React.Fragment>
      <Grid stackable className={styles.content} padded>
        <Grid.Row columns={3}>
          <Grid.Column>
              <Header as='h2'>
                <FormattedMessage {...title} />
                <Header.Subheader className={`x5spaceBefore`}>
                  <FormattedMessage {...description} />
                </Header.Subheader>
              </Header>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={startnow} />
              <Header as='h4'>
                <FormattedMessage {...startnowTitle} />
              </Header>
              <p>
                <FormattedMessage {...startnowDescription} />
              </p>

              <Link to="/compare"><FormattedMessage {...startnowLink} /></Link>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={investment} />
              <Header as='h4'>
                <FormattedMessage {...investmentTitle} />
              </Header>
              <p>
                <FormattedMessage {...investmentDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...investmentLink} /></Link>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3}>

          <Grid.Column columns={3}>
            <GreaterThanMobileSegment>
                <img src={coffeePerson} className={styles.illustration} />
            </GreaterThanMobileSegment>
            <MobileSegment>
              <img src={coffeePerson} className={styles.illustrationMobile} />
            </MobileSegment>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={growth} />
              <Header as='h4'>
                <FormattedMessage {...growthTitle} />
              </Header>
              <p>
                <FormattedMessage {...growthDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...growthLink} /></Link>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={profits} />
              <Header as='h4'>
                <FormattedMessage {...profitsTitle} />
              </Header>
              <p>
                <FormattedMessage {...profitsDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...profitsLink} /></Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
}

