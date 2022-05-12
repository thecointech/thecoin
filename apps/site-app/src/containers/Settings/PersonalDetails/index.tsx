import React, { useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Account } from '@thecointech/shared/containers/Account';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Form, Header, Icon } from 'semantic-ui-react';
import { UxDate } from '@thecointech/shared/components/MaskedInputs/UxDate';
import { UxInput, UxEmail } from '@thecointech/shared/components/UX';
import styles from './styles.module.less';

const translations = defineMessages({
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
  edit: {
    defaultMessage: 'Edit',
    description: 'app.settings.personaldetails.edit: Edit zone for the page setting / tab personal details in the app',
  },
  save: {
    defaultMessage: 'Save',
    description: 'app.settings.personaldetails.save: Edit zone for the page setting / tab personal details in the app',
  },
  name: {
    defaultMessage: 'Given Name',
    description: 'app.settings.personaldetails.name: Name field for the page setting / tab personal details in the app',
  },
  familyname: {
    defaultMessage: 'Family Name',
    description: 'app.settings.personaldetails.familyname: Name field for the page setting / tab personal details in the app',
  },
  email: {
    defaultMessage: 'Email',
    description: 'app.settings.personaldetails.email: Email field for the page setting / tab personal details in the app',
  },
  dob: {
    defaultMessage: 'Date of Birth',
    description: 'app.settings.personaldetails.dob: Date of birth field for the page setting / tab personal details in the app',
  },
  phone: {
    defaultMessage: 'Phone Number',
    description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app',
  },
  country: {
    defaultMessage: 'Country',
    description: 'app.settings.personaldetails.country: Country Adress field for the page setting / tab personal details in the app',
  },
  state: {
    defaultMessage: 'State',
    description: 'app.settings.personaldetails.state: State field for the page setting / tab personal details in the app',
  },
  address: {
    defaultMessage: 'Address',
    description: 'app.settings.personaldetails.address: Address field for the page setting / tab personal details in the app',
  },
  postalcode: {
    defaultMessage: 'Postal Code',
    description: 'app.settings.personaldetails.postalcode: Postal Code Address field for the page setting / tab personal details in the app',
  },
  city: {
    defaultMessage: 'City',
    description: 'app.settings.personaldetails.city: City Address field for the page setting / tab personal details in the app',
  },
  button: {
    defaultMessage: 'Save',
    description: 'app.settings.personaldetails.button: Button for the page setting / tab personal details in the app',
  },
});

export const PersonalDetails = () => {
  const account = AccountMap.useActive()!;
  const accountApi = Account(account.address).useApi();
  const [details, setDetails] = useState(account.details);
  const [givenNameEdit, setGivenNameEdit] = useState(false);
  const [familyNameEdit, setFamilyNameEdit] = useState(false);
  const [dobEdit, setDobEdit] = useState(false);
  const [countryEdit, setCountryEdit] = useState(false);
  const [cityEdit, setCityEdit] = useState(false);
  const [postalcodeEdit, setPostalcodeEdit] = useState(false);
  const [stateEdit, setStateEdit] = useState(false);
  const [addressEdit, setAddressEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);

  const onDetailsChange = (value?: string, name?: string) => {
    setDetails({
      ...details,
      [name as string]: value,
    });
  };
  const noValidation = () => null;

  const onSetDetails = () => {
    setGivenNameEdit(false);
    setFamilyNameEdit(false);
    setDobEdit(false);
    setCountryEdit(false);
    setCityEdit(false);
    setPostalcodeEdit(false);
    setStateEdit(false);
    setAddressEdit(false);
    setEmailEdit(false);
    setPhoneEdit(false);
    accountApi.setDetails({ ...details });
  };

  return (
    <div>
      <Header as="h5" className="appTitles">
        <FormattedMessage {...translations.title} />
      </Header>
      <Form id={styles.personalInfo}>

        <UxInput
          className="half left"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.name} />
              <a onClick={() => setGivenNameEdit(!givenNameEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </a>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.name}
          tooltip={translations.name}
          defaultValue={details.given_name}
          name="given_name"
          readOnly={!givenNameEdit}
        />

        <UxInput
          className="half right"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.familyname} />
              <span onClick={() => setFamilyNameEdit(!familyNameEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          defaultValue={details.family_name}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.familyname}
          tooltip={translations.familyname}
          name="family_name"
          readOnly={!familyNameEdit}
        />

        <UxDate
          className="half left"
          label={(
            <div>
              <FormattedMessage {...translations.dob} />
              <span onClick={() => setDobEdit(!dobEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          uxChange={onDetailsChange}
          defaultValue={details.DOB}
          name="DOB"
          readOnly={!dobEdit}
        />

        <UxEmail
          className="borderTop"
          defaultValue={details.email}
          onValue={onDetailsChange}
          intlLabel={(
            <div>
              <FormattedMessage {...translations.email} />
              <span onClick={() => setEmailEdit(!emailEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          name="email"
          readOnly={!emailEdit}
        />

        <UxInput
          className="borderTop"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.address} />
              <span onClick={() => setAddressEdit(!addressEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.address}
          tooltip={translations.address}
          defaultValue={details.address?.address}
          name="address"
          readOnly={!addressEdit}
        />

        <UxInput
          className=" half left"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.postalcode} />
              <span onClick={() => setPostalcodeEdit(!postalcodeEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.postalcode}
          tooltip={translations.postalcode}
          defaultValue={details.address?.postalcode}
          name="country"
          readOnly={!postalcodeEdit}
        />

        <UxInput
          className=" half right"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.city} />
              <span onClick={() => setCityEdit(!cityEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.city}
          tooltip={translations.city}
          defaultValue={details.address?.city}
          name="country"
          readOnly={!cityEdit}
        />

        <UxInput
          className="half left"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.state} />
              <span onClick={() => setStateEdit(!stateEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.state}
          tooltip={translations.state}
          defaultValue={details.address?.state}
          name="country"
          readOnly={!stateEdit}
        />

        <UxInput
          className="half right"
          intlLabel={(
            <div>
              <FormattedMessage {...translations.country} />
              <span onClick={() => setCountryEdit(!countryEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          onValue={onDetailsChange}
          onValidate={noValidation}
          placeholder={translations.country}
          tooltip={translations.country}
          defaultValue={details.address?.country}
          name="country"
          readOnly={!countryEdit}
        />

        <UxInput
          className="borderTop"
          defaultValue={details.phone?.phoneNumber}
          onValue={onDetailsChange}
          intlLabel={(
            <div>
              <FormattedMessage {...translations.phone} />
              <span onClick={() => setPhoneEdit(!phoneEdit)} className={styles.edit}>
                <Icon name="edit" />
                <FormattedMessage {...translations.edit} />
              </span>
            </div>
          )}
          name="phone"
          onValidate={noValidation}
          placeholder={translations.address}
          tooltip={translations.address}
          readOnly={!phoneEdit}
        />

        <Header as="h5" className="appTitles x6spaceBefore">
          <FormattedMessage {...translations.titleCurrency} />
          <Header.Subheader>
            <FormattedMessage {...translations.descriptionCurrency} />
          </Header.Subheader>
        </Header>

        <div className={styles.currencyChoices}>
          <input type="radio" id="cad" name="currency" value="CAD" />
          <label htmlFor="cad">CAD</label>
          <input type="radio" id="the" name="currency" value="THE" />
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
