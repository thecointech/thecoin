import React from "react";
import { Header, Label } from "semantic-ui-react";
import { BlogContainer } from "@thecointech/site-prismic/components";
import { BackButton } from "./BackButton";
import styles from "./ComingSoon.module.less";
import logo from '../MainNavigation/images/logo.svg';

// (Very) temporary placeholder for blog posts that are not yet ready
// (note, not putting translations in for that reason)

export const ComingSoon = () => {
  return (
    <BlogContainer backLink={<BackButton />}>
      <div className={styles.main}>

        {/* ILLUSTRATION */}
        <div className={styles.illustration}>
          <div className={styles.illustrationInner}>
            <img src={logo} className={styles.coinIcon} alt="The Coin" />
            <span className={styles.illustrationLabel}>Coming Soon</span>
          </div>
        </div>

        {/* COPY */}
        <Label id={styles.tag}>We're working on it</Label>

        <Header>
          Good writing<br />takes time.
        </Header>

        <p>
          We'd rather get it right than get it fast.<br />
          <strong>Sign up below</strong> and we'll let you know when it's ready.
        </p>

      </div>
    </BlogContainer>
  )
};
