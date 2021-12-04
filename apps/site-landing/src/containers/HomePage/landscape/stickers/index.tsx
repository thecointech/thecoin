import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import { LearnMoreLink } from 'components/LearnMoreLink';

export type Props = {
  Mobile: boolean;
}

const translations = defineMessages({
  titleLeft: {
    defaultMessage: 'You’re Wealthier',
    description: 'site.homepage.landscape.stickers.left.title: The title for the homepage landscape left sticker'
  },
  descriptionLeft: {
    defaultMessage: 'Your money is always earning. Make it earn for you.',
    description: 'site.homepage.landscape.stickers.left.description: Description for sticker for the homepage landscape left sticker'
  },
  learnMore: {
    defaultMessage: 'Learn More',
    description: 'site.homepage.landscape.stickers.left.link: Link name for sticker for the homepage landscape left sticker'
  },
  titleRight: {
    defaultMessage: 'Earth’s Healthier',
    description: 'site.homepage.landscape.stickers.right.title: The title for the homepage landscape right sticker'
  },
  descriptionRight: {
    defaultMessage: 'Be part of the solution. We offset our clients’ CO2.',
    description: 'site.homepage.landscape.stickers.right.description: Description for sticker for the homepage landscape right sticker'
  },
});

export const Stickers = (props: Props) => {

  let classForSticker = styles.cardContainer;
  if (props.Mobile === true) {
    classForSticker = styles.cardContainerMobile;
  }

  return (
    <Grid stackable columns={2} id={styles.stickers} className={classForSticker}>
      <Grid.Row columns={3}>
        <Grid.Column className={`${styles.card} x6spaceLeft`}>
          <Header as='h4'>
            <FormattedMessage {...translations.titleLeft} />
          </Header>
          <p>
            <FormattedMessage {...translations.descriptionLeft} />
          </p>

          <LearnMoreLink to="/compare"><FormattedMessage {...translations.learnMore} /></LearnMoreLink>
        </Grid.Column>
        <Grid.Column className={`${styles.card} x6spaceLeft`}>
          <Header as='h4'>
            <FormattedMessage {...translations.titleRight} />
          </Header>
          <p>
            <FormattedMessage {...translations.descriptionRight} />
          </p>
          <LearnMoreLink to="/wedomore"><FormattedMessage {...translations.learnMore} /></LearnMoreLink>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
