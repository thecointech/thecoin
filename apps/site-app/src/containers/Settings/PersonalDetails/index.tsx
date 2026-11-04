import React from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Form, Header } from 'semantic-ui-react';
import styles from './styles.module.less';


export const translations = defineMessages({
  titleCurrency: {
    defaultMessage: 'Currency',
    description: 'app.settings.personaldetails.titleCurrency: Title for the page setting / tab personal details in the app',
  },
  descriptionCurrency: {
    defaultMessage: 'Your can choose the currency you want us to display:',
    description: 'app.settings.personaldetails.descriptionCurrency: Description for the page setting / tab personal details in the app',
  },
});

export const PersonalDetails = () => {
  const account = AccountMap.useActive()!;
  const { displayCurrency } = account.details.preferences;

  return (
    <div>
      <Form id={styles.personalInfo}>
        <Header as="h5" className="appTitles">
          <FormattedMessage {...translations.titleCurrency} />
          <Header.Subheader>
            <FormattedMessage {...translations.descriptionCurrency} />
          </Header.Subheader>
        </Header>

        <div className={styles.currencyChoices}>
          <input type="radio" id="cad" name="currency" value="CAD" checked={displayCurrency == 124} readOnly />
          <label htmlFor="cad">CAD</label>
          <input type="radio" id="the" name="currency" value="THE" checked={false} readOnly />
          <label htmlFor="the">THE</label>
        </div>
      </Form>
    </div>
  );
};
