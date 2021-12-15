import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import facebook from './images/facebook.svg';
import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';
import styles from './styles.module.less';

const translate = defineMessages({
  registered1: {
    defaultMessage: "The Coin Collaborative Canada",
    description: "Registered Non profit phrase in footer part 1"
  },
  registered2: {
    defaultMessage: " is a registered non-profit",
    description: "Registered Non profit phrase in footer part 2"
  },
  copyright1: {
    defaultMessage: "© Copyright 2020. TheCoin.",
    description: "Copyright phrase in footer part1"
  },
  copyright2: {
    defaultMessage: " All Rights Reserved.",
    description: "Copyright phrase in footer part2"
  }
});

export const FooterShared = () => {

  return (
    <>
      <div className={styles.background} />
      <div className={styles.footerContent}>
        <div className={styles.registered}>
          <FormattedMessage tagName="span" {...translate.registered1} />
          <FormattedMessage tagName="span" {...translate.registered2} />
        </div>
        <div className={styles.links}>
          <a href="https://www.facebook.com/TheCoinCollaborative/" target="_blank">
            <img src={facebook} />
          </a>
          <a href="https://www.facebook.com/TheCoinCollaborative/" target="_blank">
            <img src={twitter} />
          </a>
          <a href="https://www.facebook.com/TheCoinCollaborative/" target="_blank">
            <img src={instagram} />
          </a>
        </div>
        <div className={styles.copyright}>
          <FormattedMessage  tagName="span" {...translate.copyright1} />
          <FormattedMessage  tagName="span" {...translate.copyright2} />
        </div>
      </div>
    </>
  );
}
