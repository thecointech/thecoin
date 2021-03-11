import { useAccountApi } from '@the-coin/shared/containers/Account';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import React, { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { Form, Header, Icon, InputOnChangeData } from 'semantic-ui-react';
import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';

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

const edit = {
  id: "app.settings.personaldetails.edit",
  defaultMessage: "Edit",
  description: "Edit zone for the page setting / tab personal details in the app"
};
const name = {
  id: "app.settings.personaldetails.name",
  defaultMessage: "Given Name",
  description: "Name field for the page setting / tab personal details in the app"
};
const familyname = {
  id: "app.settings.personaldetails.familyname",
  defaultMessage: "Family Name",
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
  const [givenNameEdit, setGivenNameEdit] = useState(false);
  const [familyNameEdit, setFamilyNameEdit] = useState(false);
  const [dobEdit, setDobEdit] = useState(false);
  const [addressEdit, setAddressEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);
  
  const onDetailsChange = useCallback((_, {details, name, value}: InputOnChangeData) => {
    setDetails({
      ...details,
      [name]: value,
    });
    console.log(details);
  }, [setDetails])

  const onSetDetails = useCallback(() => {
    accountApi.setDetails({...details});
    console.log(details);
  }, [details, accountApi])

  return (
    <div>
      <Header as="h5" className={`appTitles`}>
        <FormattedMessage {...title} />
      </Header>
      <Form id={sharedStyles.editableInfo}>

        <Form.Input
          className={"half left"}
          label={<div>
                    <FormattedMessage {...name} />
                    <span onClick={()=>setGivenNameEdit(!givenNameEdit)} className={sharedStyles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                </div>}
          value={details.given_name}
          onChange={onDetailsChange}
          details={details}
          name="given_name" readOnly={!givenNameEdit} />
        

        <Form.Input
          className={"half right"}
          label={<div>
                    <FormattedMessage {...familyname} />
                    <span onClick={()=>setFamilyNameEdit(!familyNameEdit)} className={sharedStyles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                </div>}
          value={details.family_name}
          onChange={onDetailsChange}
          details={details}
          name="family_name" readOnly={!familyNameEdit} />

        <Form.Input
          className={"half left"}
          label={<div>
                    <FormattedMessage {...dob} />
                    <span onClick={()=>setDobEdit(!dobEdit)} className={sharedStyles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                  </div>}
          onChange={onDetailsChange}
          details={details}
          value={details.DOB}
          name="DOB" readOnly={!dobEdit} />

        <Form.Input
          className={"borderTop borderBottom"}
          label={<div>
                    <FormattedMessage {...address} />
                    <span onClick={()=>setAddressEdit(!addressEdit)} className={sharedStyles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                  </div>}
          onChange={onDetailsChange}
          details={details}
          value={details.address}
          name="address" readOnly={!addressEdit} />

        <Form.Input
          className={"half left"}
          label={<div>
                  <FormattedMessage {...email} />
                  <span onClick={()=>setEmailEdit(!emailEdit)} className={sharedStyles.edit}>
                    <Icon name={"edit"} /><FormattedMessage {...edit} />
                  </span>
                </div>}
          value={details.email}
          onChange={onDetailsChange}
          details={details}
          name="email" readOnly={!emailEdit} />

        <Form.Input
          className={"half right"}
          details={details}
          value={details.phone}
          label={<div>
                    <FormattedMessage {...phone} />
                    <span onClick={()=>setPhoneEdit(!phoneEdit)} className={sharedStyles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                  </div>}
          onChange={onDetailsChange}
          name="phone" readOnly={!phoneEdit} />

        <Header as="h5" className={`appTitles x6spaceBefore`}>
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


