import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import { LearnMoreLink } from 'components/LearnMoreLink';

const translations = defineMessages({
    titleLeft : {
      defaultMessage: 'You’re Wealthier',
      description: 'site.homepage.landscape.stickers.left.title: The title for the homepage landscape left sticker'},
    descriptionLeft : {
      defaultMessage: "It's the same way the rich get richer, just in reverse",
      description: 'site.homepage.landscape.stickers.left.description: Description for sticker for the homepage landscape left sticker'},
    learnMore : {
      defaultMessage: 'Learn More',
      description: 'site.homepage.landscape.stickers.left.link: Link name for sticker for the homepage landscape left sticker'},
    titleRight : {
      defaultMessage: 'Earth’s Healthier',
      description: 'site.homepage.landscape.stickers.right.title: The title for the homepage landscape right sticker'},
    descriptionRight : {
      defaultMessage: "Climate action never lacked solutions. It lacked money. That's where we come in.",
      description: 'site.homepage.landscape.stickers.right.description: Description for sticker for the homepage landscape right sticker'},
  });

export const Stickers = () => {

  return (
    <div className={styles.stickers}>
      <div className={styles.card}>
        <Header as='h4'>
          <FormattedMessage {...translations.titleLeft} />
        </Header>
        <p>
          <FormattedMessage {...translations.descriptionLeft} />
        </p>
        <LearnMoreLink to="#wealthier"><FormattedMessage {...translations.learnMore} /></LearnMoreLink>
      </div>
      <div className={styles.card}>
        <Header as='h4'>
          <FormattedMessage {...translations.titleRight} />
        </Header>
        <p>
          <FormattedMessage {...translations.descriptionRight} />
        </p>
        <LearnMoreLink to="#healthier"><FormattedMessage {...translations.learnMore} /></LearnMoreLink>
      </div>
    </div>
  );
}
