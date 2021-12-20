import React from 'react';
import { Header } from 'semantic-ui-react';
import styles from './content.module.less';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Stickers } from './stickers';


const title = defineMessage({
  defaultMessage: 'The future is brighter',
  description: 'site.homepage.landscape.title: The title for the homepage'
});
const description1 = defineMessage({
  defaultMessage: 'Save, invest and spend money with TheCoin,',
  description: 'home page tagline part1'
});
const description2 = defineMessage({
  defaultMessage: 'get 100% of benefits and save our Planet.',
  description: 'home page tagline part2'
});
const button = defineMessage({
  defaultMessage: 'Start Now',
  description: 'site.homepage.landscape.button: Button label for the landscape'
});


export const Content = () => (
  <div id={styles.content}>
    <div>
      <Header as="h1">
        <FormattedMessage {...title} />
        <Header.Subheader className={styles.tagline}>
          <FormattedMessage tagName={"span"} {...description1} />
          <FormattedMessage tagName={"span"} {...description2} />
        </Header.Subheader>
      </Header>
      <ButtonPrimary className={styles.startNow} as="a" href={`${process.env.URL_SITE_APP}`} size='large'>
        <FormattedMessage {...button} />
      </ButtonPrimary>
    </div>
    <Stickers />
  </div>
);
