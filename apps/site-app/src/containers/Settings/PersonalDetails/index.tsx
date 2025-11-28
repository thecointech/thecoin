import React, { useState } from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { Account } from '@thecointech/shared/containers/Account';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Form, Header } from 'semantic-ui-react';
import { UxDate, UxEmail } from '@thecointech/shared/components/UX';
import { UserAddressInput, UserDetailsInput, UserPhoneInput } from './DetailsInput';
import { detailStrings } from './translations';
import styles from './styles.module.less';


export const translations = {
  ...defineMessages({
  title: {
    defaultMessage: 'Personal Details',
    description: 'app.settings.personaldetails.title: Title for the page setting / tab personal details in the app',
  },
  titleCurrency: {
    defaultMessage: 'Currency',
    description: 'app.settings.personaldetails.titleCurrency: Title for the page setting / tab personal details in the app',
  },
  descriptionCurrency: {
    defaultMessage: 'Your can choose the currency you want us to display:',
    description: 'app.settings.personaldetails.descriptionCurrency: Description for the page setting / tab personal details in the app',
  },
  save: {
    defaultMessage: 'Save',
    description: 'app.settings.personaldetails.save: Edit zone for the page setting / tab personal details in the app',
  },
  button: {
    defaultMessage: 'Save',
    description: 'app.settings.personaldetails.button: Button for the page setting / tab personal details in the app',
  },

  edit: {
    defaultMessage: 'Save',
    description: 'app.settings.personaldetails.button: Button for the page setting / tab personal details in the app',
  },
}),
  ...detailStrings
};

export const PersonalDetails = () => {
  const account = AccountMap.useActive()!;
  const accountApi = Account(account.address).useApi();
  const [details, setDetails] = useState(account.details);

  const onDetailsChange = (value: Record<string, string>, name: string) => {
    setDetails({
      ...details,
      [name as string]: value,
    });
  };
  const onSetDetails = () => accountApi.setDetails({ ...details });

  return (
    <div>
      <Header as="h5" className="appTitles">
        <FormattedMessage {...translations.title} />
      </Header>
      <Form id={styles.personalInfo}>

        <UserDetailsInput
          className="half left"
          onValue={onDetailsChange}
          property="given_name"
        />

        <UserDetailsInput
          className="half right"
          onValue={onDetailsChange}
          property="family_name"
        />

        <UserDetailsInput
          InputType={UxDate}
          className="half left"
          onValue={onDetailsChange}
          property="DOB"
        />

        <hr className={styles.hr} />

        <UserDetailsInput
          InputType={UxEmail}
          className="half left"
          onValue={onDetailsChange}
          property="email"
        />

        <UserPhoneInput
          className="half right"
          onValue={onDetailsChange}
          property="number"
        />

        <hr className={styles.hr} />

        <UserAddressInput
          className="half left"
          onValue={onDetailsChange}
          property="address"
        />

        <UserAddressInput
          className="half right"
          onValue={onDetailsChange}
          property="extraInfo"
        />

        <UserAddressInput
          className="half left"
          onValue={onDetailsChange}
          property="postalCode"
        />

        <UserAddressInput
          className="half right"
          onValue={onDetailsChange}
          property="city"
        />

        <UserAddressInput
          className="half left"
          onValue={onDetailsChange}
          property="state"
        />

        <UserAddressInput
          className="half right"
          onValue={onDetailsChange}
          property="country"
        />

        <hr className={styles.hr} />

        <Header as="h5" className="appTitles x6spaceBefore">
          <FormattedMessage {...translations.titleCurrency} />
          <Header.Subheader>
            <FormattedMessage {...translations.descriptionCurrency} />
          </Header.Subheader>
        </Header>

        <div className={styles.currencyChoices}>
          <input type="radio" id="cad" name="currency" value="CAD" checked={account.details.displayCurrency == 124} />
          <label htmlFor="cad">CAD</label>
          <input type="radio" id="the" name="currency" value="THE" checked={false} />
          <label htmlFor="the">THE</label>
        </div>
        <div className="x6spaceBefore">
          <ButtonTertiary onClick={onSetDetails} loading={account.idxIO}>
            <FormattedMessage {...translations.button} />
          </ButtonTertiary>
        </div>
      </Form>
    </div>
  );
};
