import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import coffeePerson from './images/3_illustration.svg';
import startnow from './images/icon3_01.svg';
import investment from './images/icon3_02.svg';
import growth from './images/icon3_03.svg';
import profits from './images/icon3_04.svg';
import { SectionItem } from '../SectionItem';

const translations = defineMessages({
  title: {
    defaultMessage: 'You’re Wealthier',
    description: 'site.homepage.wealthier.title: The title for the homepage wealthier'
  },
  description: {
    defaultMessage: 'Enjoy the benefits of investment growth on every dollar with our online spending account.',
    description: 'site.homepage.wealthier.description: The description for the homepage wealthier'
  },
});

const items = {
  startNow: {
    img: startnow,
    to: '/blog/start-now',
    text: defineMessages({
      title: {
        defaultMessage: 'Start Now',
        description: 'site.homepage.wealthier.startnow.title: The title for the star now for the homepage wealthier'
      },
      description: {
        defaultMessage: 'The most important ingredient is time. You’re young - maximize your benefit!',
        description: 'site.homepage.wealthier.startnow.description: The description for the star now for the homepage wealthier'
      },
      link: {
        defaultMessage: 'Learn Your Edge',
        description: 'site.homepage.wealthier.startnow.link: The link for the star now for the homepage wealthier'
      },
    })
  },
  investment: {
    img: investment,
    to: '/compare',
    text: defineMessages({
      title: {
        defaultMessage: 'The Best Investment',
        description: 'site.homepage.wealthier.investment.title: The title for the investment for the homepage wealthier'
      },
      description: {
        defaultMessage: 'Why settle? Our time-tested strategy has the best long-term results.',
        description: 'site.homepage.wealthier.investment.description: The description for the investment for the homepage wealthier'
      },
      link: {
        defaultMessage: 'Compare Us',
        description: 'site.homepage.wealthier.investment.link: The link for the investment for the homepage wealthier'
      },
    })
  },
  growth: {
    img: growth,
    to: '/compare',
    text: defineMessages({
      title: {
        defaultMessage: 'Maximum Growth',
        description: 'site.homepage.wealthier.growth.title: The title for the growth for the homepage wealthier'
      },
      description: {
        defaultMessage: 'Add $250000 to your retirement - with no money down.',
        description: 'site.homepage.wealthier.growth.description: The title for the growth for the homepage wealthier'
      },
      link: {
        defaultMessage: 'How Anyone Can Get Rich Slow',
        description: 'site.homepage.wealthier.growth.link: The link for the growth for the homepage wealthier'
      },
    })
  },
  profits: {
    img: profits,
    to: '/compare',
    text: defineMessages({
      title: {
        defaultMessage: 'Keep Your Profits',
        description: 'site.homepage.wealthier.profits.title: The title for the profits for the homepage wealthier'
      },
      description: {
        defaultMessage: 'Every dollar earns every day. As a non-profit, we want you to keep that benefit.',
        description: 'site.homepage.wealthier.profits.description: The description for the profits for the homepage wealthier'
      },
      link: {
        defaultMessage: 'Who Wins?',
        description: 'site.homepage.wealthier.profits.link: The link for the profits for the homepage wealthier'
      }
    })
  }
}



export const Wealthier = () => (
  <>
    <div className={styles.background} />
    <div className={styles.content}>
      <div className={styles.title}>
        <Header as='h2'>
          <FormattedMessage {...translations.title} />
          <Header.Subheader className={`x5spaceBefore`}>
            <FormattedMessage {...translations.description} />
          </Header.Subheader>
        </Header>
      </div>
      <SectionItem {...items.startNow} />
      <SectionItem {...items.investment} />
      <div className={styles.illustration}>
        <img src={coffeePerson} />
      </div>
      <SectionItem {...items.growth} />
      <SectionItem {...items.profits} />
    </div>
  </>
)

