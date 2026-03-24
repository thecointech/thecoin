import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import co2 from './images/icon_5_1.svg';
import science from './images/icon_5_2.svg';
import trees from './images/icon_5_3.svg';

import { Header } from 'semantic-ui-react';
import { SectionItem } from '../SectionItem';
import { defineMessage } from '@formatjs/intl';

import bgtop_planet from './images/bgtop_planet.svg';
import { FormattedMessageWithBreaks } from 'components/FormattedMessageWithBreaks';


const translations = defineMessages({
  title : {
    defaultMessage: 'Earth’s Healthier',
    description: 'site.homepage.underwater.title: Title for that homepage underwater part'},
  description : {
    defaultMessage: "Money is the most powerful tool we have.{br}Let's make it work for us, for a change.",
    description: 'site.homepage.underwater.description: Description for the homepage underwater part1'},
})

const items = {
  difference: {
    img: co2,
    to: "/blog/coming-soon",
    text: {
      title: defineMessage({
        defaultMessage: 'Do What Matters',
        description: 'site.homepage.underwater.difference.title: Title for the homepage underwater difference subpart'}),
      description: defineMessage({
        defaultMessage: 'Offsetting CO2 is effective.{br}Extremely effective.',
        description: 'site.homepage.underwater.difference.description: Description for the homepage underwater difference subpart'}),
      link: defineMessage({
        defaultMessage: 'Compare Outcomes',
        description: 'site.homepage.underwater.difference.link: Link for the homepage underwater difference subpart'}),
    }
  },
  science: {
    img: science,
    to: "/blog/coming-soon",
    text: {
      title: defineMessage({
        defaultMessage: 'Scientifically Verified',
        description: 'site.homepage.underwater.science.title: Title for the homepage underwater science subpart'}),
      description: defineMessage({
        defaultMessage: 'Prove it? We’d love to!',
        description: 'site.homepage.underwater.science.description: Description for the homepage underwater science subpart'}),
      link: defineMessage({
        defaultMessage: 'Why We Can Be So Confident',
        description: 'site.homepage.underwater.science.link: Link for the homepage underwater science subpart'}),
    }
  },
  trees: {
    img: trees,
    to: "/wedomore",
    text: {
      title: defineMessage({
        defaultMessage: 'We Do More',
        description: 'site.homepage.underwater.trees.title: Title for the homepage underwater trees subpart'}),
      description: defineMessage({
        defaultMessage: "It's more than CO2. We fund the changes we all know the world needs.",
        description: 'site.homepage.underwater.trees.description: Description for the homepage underwater trees subpart'}),
      link: defineMessage({
        defaultMessage: 'What We Do',
        description: 'site.homepage.underwater.trees.link: Link for the homepage underwater trees subpart'}),
    }
  }
};

export const Healthier = () => {

  return (
    <div className={styles.content} id="healthier">
      <div className={styles.headerImage}>
        <img src={bgtop_planet} />
      </div>
      <div className={styles.body} >
        <Header as='h2' className={styles.title}>
          <FormattedMessage {...translations.title} />
          <Header.Subheader className={`x5spaceBefore`}>
            <FormattedMessageWithBreaks tagName='span' {...translations.description} />
          </Header.Subheader>
        </Header>
        <div className={styles.items} >
          <SectionItem {...items.difference} />
          <SectionItem {...items.science} />
          <SectionItem {...items.trees} />
        </div>
      </div>
    </div>
  );
}

