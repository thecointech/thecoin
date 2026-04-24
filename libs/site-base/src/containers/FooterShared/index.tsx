import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import facebook from './images/facebook.svg';
// import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';
import bluesky from './images/bluesky.svg';
import mastodon from './images/mastodon.svg';
import linkedin from './images/linkedin.svg';
import medium from './images/medium.svg';
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
    defaultMessage: "© 2020",
    description: "Copyright phrase in footer part1"
  },
  copyright2: {
    defaultMessage: "TheCoin Collaborative Canada",
    description: "Copyright phrase in footer part2"
  }
});

type Props = {
  background?: string;
  id?: string;
  children?: React.ReactNode;
}
export const FooterShared: React.FC<Props> = ({ children, background, id }) => (
  <>
    <div className={`${styles.background} ${background ?? ''}`} />
    <footer className={styles.footerContainer}>
      {children}
      <div id={id} className={styles.footerContent}>
        <div className={`${styles.textPortion} ${styles.registered}`}>
          <FormattedMessage tagName="span" {...translate.registered1} />
          <FormattedMessage tagName="span" {...translate.registered2} />
        </div>
        <div className={styles.links}>
          <a aria-label="Facebook" href="https://www.facebook.com/TheCoinCollaborative/" target="_blank">
            <img src={facebook} alt="" />
          </a>
          {/* <a href="https://twitter.com/The_Green_NFT/" target="_blank">
            <img src={twitter} />
          </a> */}
          <a aria-label="Instagram" href="https://www.instagram.com/thecoincollaborative/" target="_blank">
            <img src={instagram} alt="" />
          </a>
          <a aria-label="Bluesky" href="https://bsky.app/profile/thecoin.io" target="_blank">
            <img src={bluesky} alt="" />
          </a>
          <a aria-label="LinkedIn" href="https://ca.linkedin.com/company/the-coin" target="_blank">
            <img src={linkedin} alt="" />
          </a>
          <a aria-label="Mastodon" href="https://mastodon.social/@thecoincollaborative" target="_blank">
            <img src={mastodon} alt="" />
          </a>
          <a aria-label="Medium" href="https://medium.com/thecoin-newsletters" target="_blank">
            <img src={medium} alt="" />
          </a>
        </div>
        <div className={`${styles.textPortion} ${styles.copyright}`}>
          <FormattedMessage tagName="span" {...translate.copyright1} />
          <FormattedMessage tagName="span" {...translate.copyright2} />
        </div>
      </div>
    </footer>
  </>
);
