import React, { useState } from 'react';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Form, Header, Icon } from 'semantic-ui-react';
import { UxDate } from '@thecointech/shared/components/MaskedInputs/UxDate';
import styles from './styles.module.less';
import { UxInput } from '@thecointech/shared/components/UxInput';
import { useAccountApi } from '@thecointech/shared/containers/Account';

const translations = defineMessages({
  title : {
      defaultMessage: 'Personal Details',
      description: 'app.settings.personaldetails.title: Title for the page setting / tab personal details in the app'},
  titleCurrency : {
      defaultMessage: 'Currency',
      description: 'app.settings.personaldetails.titleCurrency: Title for the page setting / tab personal details in the app'},
  descriptionCurrency : {
      defaultMessage: 'Your can choose the currency you want us to display:',
      description: 'app.settings.personaldetails.descriptionCurrency: Description for the page setting / tab personal details in the app'},
  edit : {
      defaultMessage: 'Edit',
      description: 'app.settings.personaldetails.edit: Edit zone for the page setting / tab personal details in the app'},
  name : {
      defaultMessage: 'Given Name',
      description: 'app.settings.personaldetails.name: Name field for the page setting / tab personal details in the app'},
  familyname : {
      defaultMessage: 'Family Name',
      description: 'app.settings.personaldetails.familyname: Name field for the page setting / tab personal details in the app'},
  email : {
      defaultMessage: 'Email',
      description: 'app.settings.personaldetails.email: Email field for the page setting / tab personal details in the app'},
  dob : {
      defaultMessage: 'Date of Birth',
      description: 'app.settings.personaldetails.dob: Date of birth field for the page setting / tab personal details in the app'},
  phone : {
      defaultMessage: 'Phone Number',
      description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app'},
  address : {
      defaultMessage: 'Full Address',
      description: 'app.settings.personaldetails.address: Full Address field for the page setting / tab personal details in the app'},
  button : {
      defaultMessage: 'Save',
      description: 'app.settings.personaldetails.button: Button for the page setting / tab personal details in the app'}
});

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

  const onDetailsChange = (value: string, name?: string) => {
    setDetails({
      ...details,
      [name as string]: value,
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

  return (
    <div>
      <Header as="h5" className={`appTitles`}>
        <FormattedMessage {...translations.title} />
      </Header>
      <Form id={styles.personalInfo}>

        <UxInput
            className={"half left"}
            intlLabel={<div>
                        <FormattedMessage {...translations.name} />
                        <span onClick={()=>setGivenNameEdit(!givenNameEdit)} className={styles.edit}>
                          <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                        </span>
                    </div>}
            uxChange={(value: string) => onDetailsChange(value,"given_name")}
            details={details}
            value={details.given_name}
            name="given_name" 
            readOnly={!givenNameEdit}
          />

        <UxInput
          className={"half right"}
          intlLabel={<div>
                    <FormattedMessage {...translations.familyname} />
                    <span onClick={()=>setFamilyNameEdit(!familyNameEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                    </span>
                </div>}
          value={details.family_name}
          uxChange={(value: string) => onDetailsChange(value,"family_name" )}
          details={details}
          name="family_name" 
          readOnly={!familyNameEdit} />

        <UxDate
          className={"half left"}
          value={details.DOB}
          label={<div>
                    <FormattedMessage {...translations.dob} />
                    <span onClick={()=>setDobEdit(!dobEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                    </span>
                  </div>}
          uxChange={(value: string) => onDetailsChange(value,"DOB")}
          details={details}
          defaultValue={details.DOB}
          name="DOB" readOnly={!dobEdit} />

        <UxInput
          className={"borderTop borderBottom"}
          intlLabel={<div>
                    <FormattedMessage {...translations.address} />
                    <span onClick={()=>setAddressEdit(!addressEdit)} className={styles.edit}>
                      <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                    </span>
                  </div>}
          uxChange={(value: string) => onDetailsChange(value,"address")}
          details={details}
          value={details.address}
          name="address" readOnly={!addressEdit} />

        <UxInput
            className={"half left"}
            details={details}
            value={details.email}
            uxChange={(value: string) => onDetailsChange(value,"email")}
            intlLabel={<div>
                <FormattedMessage {...translations.email} />
                <span onClick={()=>setEmailEdit(!emailEdit)} className={styles.edit}>
                  <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                </span>
              </div>} 
            name="email" 
            readOnly={!emailEdit} />
          
        <UxInput 
            className={"half right"}
            details={details}
            value={details.phone}
            uxChange={(value: string) => onDetailsChange(value,"phone")}
            intlLabel={<div>
                <FormattedMessage {...translations.phone} />
                <span onClick={()=>setPhoneEdit(!phoneEdit)} className={styles.edit}>
                  <Icon name={"edit"} /><FormattedMessage {...translations.edit} />
                </span>
              </div>} 
            name="phone" 
            readOnly={!phoneEdit} />

        <Header as="h5" className={`appTitles x6spaceBefore`}>
          <FormattedMessage {...translations.titleCurrency} />
          <Header.Subheader>
            <FormattedMessage  {...translations.descriptionCurrency} />
          </Header.Subheader>
        </Header>

        <div className={styles.currencyChoices}>
          <input type="radio" id="cad" name="currency" value="CAD" /><label htmlFor="cad">CAD</label>
          <input type="radio" id="the" name="currency" value="THE" /><label htmlFor="the">THE</label>
        </div>
        <div className={"x6spaceBefore"}>
          <ButtonTertiary onClick={onSetDetails} loading={account.idxIO}>
            <FormattedMessage {...translations.button} />
          </ButtonTertiary>
        </div>
      </Form>
    </div>
  );
}


