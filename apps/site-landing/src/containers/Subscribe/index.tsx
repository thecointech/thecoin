import React from 'react';
import styles from './styles.module.less';
import { defineMessages } from 'react-intl';
import { Helmet } from "react-helmet-async";
import { FormattedMessageWithBreaks } from 'components/FormattedMessageWithBreaks';

const translations = defineMessages({
  description : {
    defaultMessage: "Would you like to know more?{br}Subscribe to get the nitty-gritty",
    description: 'Footer CTA Part1'
  },
});

export const Subscribe = () => {

  return (
    <div id={styles.subscribeBlock}>
      <span className={styles.message}>
        <h3>
          <FormattedMessageWithBreaks tagName="div" {...translations.description} />
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
