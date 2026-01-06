import React from 'react';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Helmet } from "react-helmet-async";

const translations = defineMessages({
  description1 : {
    defaultMessage: 'The future is better because of you & us.',
    description: 'Footer CTA Part1'},
  description2 : {
      defaultMessage: 'Subscribe to our newsletter:',
      description: 'Footer CTA Part2'},
});

export const Subscribe = () => {

  return (
    <div id={styles.subscribeBlock}>
      <span className={styles.message}>
        <h3>
          <FormattedMessage tagName="div" {...translations.description1} />
          <FormattedMessage tagName="div" {...translations.description2} />
        </h3>
      </span>
      <span className={styles.subscribeForm}>
        <iframe
          title="Newsletter subscription form"
          referrerPolicy="strict-origin-when-cross-origin"
          data-w-type="embedded"
          src="https://x15lr.mjt.lu/wgt/x15lr/0mkp/form?c=d2c683cc"
          width="100%"
          style={{height: 0}}
        />
        <Helmet>
          <script
            key="mailjet-embed"
            defer
            type="text/javascript"
            src="https://app.mailjet.com/pas-nc-embedded-v1.js"
          />
        </Helmet>
      </span>
    </div>
  );
};
