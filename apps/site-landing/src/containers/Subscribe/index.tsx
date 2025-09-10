import React from 'react';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import {Helmet} from "react-helmet";

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
        <iframe data-w-type="embedded" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src="https://x15lr.mjt.lu/wgt/x15lr/0mkp/form?c=d2c683cc" width="100%" style={{height: 0}}></iframe>
        <Helmet>
          <script type="text/javascript" src="https://app.mailjet.com/pas-nc-embedded-v1.js"></script>
        </Helmet>
      </span>
    </div>
  );
};
