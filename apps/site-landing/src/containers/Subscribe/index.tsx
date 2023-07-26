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
        <iframe className="mj-w-res-iframe" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src="https://app.mailjet.com/widget/iframe/3TFt/MhQ" width="100%"></iframe>
        <Helmet>
          <script type="text/javascript" src="https://app.mailjet.com/statics/js/iframeResizer.min.js"></script>
        </Helmet>
      </span>
    </div>
  );
};
