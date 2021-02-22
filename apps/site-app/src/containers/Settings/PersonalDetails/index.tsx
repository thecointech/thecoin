import { useAccountApi } from '@the-coin/shared/containers/Account';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import React, { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { Form, Header, InputOnChangeData } from 'semantic-ui-react';
import styles from './styles.module.less';

const title = {
  id: "app.settings.personaldetails.title",
  defaultMessage: "Personal Details",
  description: "Title for the page setting / tab personal details in the app"
};
const titleCurrency = {
  id: "app.settings.personaldetails.titleCurrency",
  defaultMessage: "Currency",
  description: "Title for the currency section of the page setting / tab personal details in the app"
};
const descriptionCurrency = {
  id: "app.settings.personaldetails.descriptionCurrency",
  defaultMessage: "Your can choose the currency you want us to display:",
  description: "Title for the currency section of the page setting / tab personal details in the app"
};
const name = {
  id: "app.settings.personaldetails.name",
  defaultMessage: "Given Name",
  description: "Name field for the page setting / tab personal details in the app"
};
const email = {
  id: "app.settings.personaldetails.email",
  defaultMessage: "Email",
  description: "Email field for the page setting / tab personal details in the app"
};
const dob = {
  id: "app.settings.personaldetails.dob",
  defaultMessage: "Date of Birth",
  description: "Date of birth field for the page setting / tab personal details in the app"
};
const phone = {
  id: "app.settings.personaldetails.phone",
  defaultMessage: "Phone Number",
  description: "Phone field for the page setting / tab personal details in the app"
};
const address = {
  id: "app.settings.personaldetails.address",
  defaultMessage: "Full Address",
  description: "Address field for the page setting / tab personal details in the app"
};
const button = {
  id: "app.settings.personaldetails.button",
  defaultMessage: "Save",
  description: "Content for the page setting / tab personal details in the app"
};

export const PersonalDetails = () => {

  const account = useActiveAccount()!;
  const accountApi = useAccountApi(account.address);
  const [details, setDetails] = useState(account.details);

  const onDetailsChange = useCallback((_, {details, name, value}: InputOnChangeData) => {
    setDetails({
      ...details,
      [name]: value
    });
  }, [setDetails])

  const onSetDetails = useCallback(() => {
    accountApi.setDetails({...details});
  }, [details, accountApi])

  return (
    <div>
      <Header as="h5" className={`appTitles`}>
        <FormattedMessage {...title} />
      </Header>
      <Form>
        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...name} />}
          value={details.given_name || ""}
          onChange={onDetailsChange}
          details={details}
          name="given_name" />

        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...email} />}
          name="email" />

        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...dob} />}
          name="dob" />
        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...phone} />}
          name="phone" />

        <Form.Input
          className={"borderTop borderBottom"}
          label={<FormattedMessage {...address} />}
          name="address" />

        <Header as="h5" className={`appTitles`}>
          <FormattedMessage {...titleCurrency} />
          <Header.Subheader>
            <FormattedMessage  {...descriptionCurrency} />
          </Header.Subheader>
        </Header>

        <div className={styles.currencyChoices}>
          <input type="radio" id="cad" name="currency" value="CAD" /><label htmlFor="cad">CAD</label>
          <input type="radio" id="the" name="currency" value="THE" /><label htmlFor="the">THE</label>
        </div>
        <div className={"x6spaceBefore"}>
          <ButtonTertiary onClick={onSetDetails} loading={account.idxIO}>
            <FormattedMessage {...button} />
          </ButtonTertiary>
        </div>
      </Form>
    </div>
  );
}


