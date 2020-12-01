import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import coffeePerson from './images/3_illustration.svg';
import startnow from './images/icon3_01.svg';
import investment from './images/icon3_02.svg';
import growth from './images/icon3_03.svg';
import profits from './images/icon3_04.svg';
import { GreaterThanMobileSegment, MobileSegment } from 'components/ResponsiveTool';


export const Wealthier = () => {

  return (
    <React.Fragment>
      <Grid stackable className={styles.content} padded>
        <Grid.Row columns={3}>
          <Grid.Column>
              <Header as='h2'>
                <FormattedMessage id="site.homepage.wealthier.title"
                      defaultMessage="You’re Wealthier"
                      description="Title"
                 />
              </Header>
              <p>
                <FormattedMessage id="site.homepage.wealthier.description"
                      defaultMessage="Enjoy the benefits of investment growth on every dollar with our online spending account."
                      description="Description"
                />
              </p>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={startnow} />
              <Header as='h4'>
                <FormattedMessage id="site.homepage.wealthier.startnow.title"
                      defaultMessage="Start Now"
                      description="Title"
                />
              </Header>
              <p>
                <FormattedMessage id="site.homepage.wealthier.startnow.description"
                      defaultMessage="The most important ingredient is time. You’re young - maximize your benefit!"
                      description="Description"
                />
              </p>
              <a href="">
                <FormattedMessage id="site.homepage.wealthier.startnow.link"
                      defaultMessage="Learn Your Edge"
                      description="Link"
                />
              </a>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={investment} />
              <Header as='h4'>
                <FormattedMessage id="site.homepage.wealthier.investment.title"
                      defaultMessage="The Best Investment"
                      description="Title"
                />
              </Header>
              <p>
                <FormattedMessage id="site.homepage.wealthier.investment.description"
                      defaultMessage="Why settle? Our time-tested strategy has the best long-term results."
                      description="Description"
                />
              </p>
              <a href="">
                <FormattedMessage id="site.homepage.wealthier.investment.link"
                      defaultMessage="Compare Us"
                      description="Link"
                />
              </a>
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
                <FormattedMessage id="site.homepage.wealthier.growth.title"
                      defaultMessage="Maximum Growth"
                      description="Title"
                />
              </Header>
              <p>
                <FormattedMessage id="site.homepage.wealthier.growth.description"
                      defaultMessage="Add $250000 to your retirement - with no money down."
                      description="Description"
                />
              </p>
              <a href="">
                <FormattedMessage id="site.homepage.wealthier.growth.link"
                      defaultMessage="How Anyone Can Get Rich Slow"
                      description="Link"
                />
              </a>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={profits} />
              <Header as='h4'>
                <FormattedMessage id="site.homepage.wealthier.profits.title"
                      defaultMessage="Keep Your Profits"
                      description="Title"
                />
              </Header>
              <p>
                <FormattedMessage id="site.homepage.wealthier.profits.description"
                      defaultMessage="Every dollar earns every day. As a non-profit, we want you to keep that benefit."
                      description="Description"
                />
              </p>
              <a href="">
                <FormattedMessage id="site.homepage.wealthier.profits.link"
                      defaultMessage="Who Wins?"
                      description="Link"
                />
              </a>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
}

