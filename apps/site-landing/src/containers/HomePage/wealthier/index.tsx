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
import { FormattedMessageWithBreaks } from 'components/FormattedMessageWithBreaks';

const translations = defineMessages({
  title: {
    defaultMessage: 'You’re Wealthier',
    description: 'site.homepage.wealthier.title: The title for the homepage wealthier'
  },
  description: {
    defaultMessage: "Zero cost. Zero risk.{br}Time to build a better life.{br}We didn't believe it was possible until we built it. Here's how it works.",
    description: 'site.homepage.wealthier.description: The description for the homepage wealthier'
  },
});

const items = {
  startNow: {
    img: startnow,
    to: '/blog/coming-soon',
    text: defineMessages({
      title: {
        defaultMessage: 'What does "Zero Cost" really mean?',
        description: 'site.homepage.wealthier.startnow.title: The title for the star now for the homepage wealthier'
      },
      description: {
        defaultMessage: "No fees is easy.  Earning on $0 is hard.  Here's how we make something out of nothing.",
        description: 'site.homepage.wealthier.startnow.description: The description for the star now for the homepage wealthier'
      },
      link: {
        defaultMessage: 'This is our edge',
        description: 'site.homepage.wealthier.startnow.link: The link for the star now for the homepage wealthier'
      },
    })
  },
  investment: {
    img: investment,
    to: '/blog/coming-soon',
    text: defineMessages({
      title: {
        defaultMessage: 'Your Safety Net',
        description: 'site.homepage.wealthier.investment.title: The title for the investment for the homepage wealthier'
      },
      description: {
        defaultMessage: "Investing is a roller-coaster. Our account protection can put the floor back under your feet.",
        description: 'site.homepage.wealthier.investment.description: The description for the investment for the homepage wealthier'
      },
      link: {
        defaultMessage: 'How to sleep easy',
        description: 'site.homepage.wealthier.investment.link: The link for the investment for the homepage wealthier'
      },
    })
  },
  growth: {
    img: growth,
    to: '/blog/think-investing-is-only-for-the-wealthy--think-again',
    text: defineMessages({
      title: {
        defaultMessage: "It's about time",
        description: 'site.homepage.wealthier.growth.title: The title for the growth for the homepage wealthier'
      },
      description: {
        defaultMessage: "You'll never stop buying groceries. That could add $250000 to your retirement.",
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
    to: '/blog/coming-soon',
    text: defineMessages({
      title: {
        defaultMessage: 'We all win when you win',
        description: 'site.homepage.wealthier.profits.title: The title for the profits for the homepage wealthier'
      },
      description: {
        defaultMessage: "We're a non-profit focused on climate action. That's why we have to be the most selfish choice. Yes, really.",
        description: 'site.homepage.wealthier.profits.description: The description for the profits for the homepage wealthier'
      },
      link: {
        defaultMessage: "The catch? There isn't one",
        description: 'site.homepage.wealthier.profits.link: The link for the profits for the homepage wealthier'
      }
    })
  }
}



export const Wealthier = () => (
  <>
    <div className={styles.background} />
    <div id="wealthier" className={styles.content}>
      <div className={styles.title}>
        <Header as='h2'>
          <FormattedMessage {...translations.title} />
          <Header.Subheader className={`x5spaceBefore`}>
            <FormattedMessageWithBreaks {...translations.description} />
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

