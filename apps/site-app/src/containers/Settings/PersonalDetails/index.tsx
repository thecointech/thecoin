import React, { useState } from 'react';
import { useAccountApi } from '@thecointech/shared/containers/Account';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form, Header, Icon, StrictInputProps } from 'semantic-ui-react';
import { UxPhone } from '@thecointech/shared/components/MaskedInputs/UxPhone';
import { UxDate } from '@thecointech/shared/components/MaskedInputs/UxDate';
import styles from './styles.module.less';
import { UxInput } from '@thecointech/shared/components/UxInput';

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

  const onDetailsChange: StrictInputProps['onChange'] = (_, {details, name, value}) => {
    setDetails({
      ...details,
      [name]: value,
    });
  }
  const onSetDetails = () => {
    setGivenNameEdit(false);
    setFamilyNameEdit(false);
    setDobEdit(false);
    setAddressEdit(false);
    setEmailEdit(false);
    setPhoneEdit(false);
    accountApi.setDetails({...details});
  }

  const intl = useIntl();
  
  return (
    <div>
      <Header as="h5" className={`appTitles`}>
        <FormattedMessage {...title} />
      </Header>
      <Form id={styles.personalInfo}>
        

          <UxInput
              className={"half left"}
              label={<div>
                            <FormattedMessage {...name} />
                            <span onClick={()=>setGivenNameEdit(!givenNameEdit)} className={styles.edit}>
                              <Icon name={"edit"} /><FormattedMessage {...edit} />
                            </span>
                        </div>}
              uxChange={onDetailsChange}
              details={details}
              isValid={true}
              placeholder={intl.formatMessage(button)}
              name="given_name" readOnly={!givenNameEdit} 
            />

        <Form.Input
          className={"half left"}
          label={<div>
                    <FormattedMessage {...name} />
                    <span onClick={()=>setGivenNameEdit(!givenNameEdit)} className={styles.edit}>
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
                    <span onClick={()=>setFamilyNameEdit(!familyNameEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                </div>}
          value={details.family_name}
          onChange={onDetailsChange}
          details={details}
          name="family_name" readOnly={!familyNameEdit} />

        <UxDate
          className={"half left"}
          label={<div>
                    <FormattedMessage {...dob} />
                    <span onClick={()=>setDobEdit(!dobEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                  </div>}
          onChange={() => onDetailsChange}
          details={details}
          value={details.DOB}
          name="DOB" readOnly={!dobEdit} />

        <Form.Input
          className={"borderTop borderBottom"}
          label={<div>
                    <FormattedMessage {...address} />
                    <span onClick={()=>setAddressEdit(!addressEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...edit} />
                    </span>
                  </div>}
          onChange={onDetailsChange}
          details={details}
          value={details.address}
          name="address" readOnly={!addressEdit} />

        <Form.Input
            className={"half left"}
            details={details}
            value={details.phone}
            onChange={() => onDetailsChange}
            label={<div>
                <FormattedMessage {...email} />
                <span onClick={()=>setEmailEdit(!emailEdit)} className={styles.edit}>
                  <Icon name={"edit"} /><FormattedMessage {...edit} />
                </span>
              </div>} 
            name="email" readOnly={!emailEdit} />
          
        <UxPhone 
            className={"half right"}
            details={details}
            value={details.phone}
            onChange={() => onDetailsChange}
            label={<div>
                <FormattedMessage {...phone} />
                <span onClick={()=>setPhoneEdit(!phoneEdit)} className={styles.edit}>
                  <Icon name={"edit"} /><FormattedMessage {...edit} />
                </span>
              </div>} 
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


