import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Header, Message } from 'semantic-ui-react';
import { Helmet } from "react-helmet-async";
import styles from './styles.module.less';

const translations = defineMessages({
  above: {
    defaultMessage: "Thank you for your interest!",
    description: "Super-title on apply beta",
  },
  title: {
    defaultMessage: "Apply to join",
    description: "Title on request access page"
  },
  blurb: {
    defaultMessage: "TheCoin is currently in a closed beta.{br} \
      Apply for early access and help us build the best possible product",
    description: "Title on request access page",
    values: { br: <br /> }
  },
  whatToExpectHeader: {
    defaultMessage: "What to expect from the beta.",
    description: "Title on request access page",
  },
  whatToExpectContent: {
    defaultMessage: "While TheCoin is fully functional, there may \
      be superficial issues, occasional bugs, and changes in functionality.",
    description: "Title on request access page"
  }
})
declare global {
  interface Window { prefinery: any; }
}

export const ApplyBeta = () => {
  useEffect(() => {
    window.prefinery=window.prefinery||function(){(window.prefinery.q = window.prefinery.q || []).push(arguments)};
  }, []);

  return (
    <div className={styles.page}>

      <Header as="h5" className={`x8spaceBefore`}>
        <FormattedMessage {...translations.above} />
      </Header>

      <Header as="h2">
        <FormattedMessage {...translations.title} />
      </Header>
      <p>
        <FormattedMessage {...translations.blurb} />
      </p>
      <Message>
        <Message.Header>
          <FormattedMessage {...translations.whatToExpectHeader} />
        </Message.Header>
        <Message.Content>
          <FormattedMessage {...translations.whatToExpectContent} />
        </Message.Content>
      </Message>
      <div className='prefinery-form-embed'>
      </div>
      <Helmet>
        <script src="https://widget.prefinery.com/widget/v2/5jn8p69h.js" defer></script>
      </Helmet>
    </div>
  );
}
