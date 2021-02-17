import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Radio } from 'semantic-ui-react';

const title = { id:"app.settings.personaldetails.title",
                defaultMessage:"Personal Details",
                description:"Title for the page setting / tab personal details in the app" };
const titleCurrency = { id:"app.settings.personaldetails.titleCurrency",
                defaultMessage:"Currency",
                description:"Title for the currency section of the page setting / tab personal details in the app" };
const descriptionCurrency = { id:"app.settings.personaldetails.descriptionCurrency",
                defaultMessage:"Your can choose the currency you want us to display:",
                description:"Title for the currency section of the page setting / tab personal details in the app" };
const name = { id:"app.settings.personaldetails.name",
                defaultMessage:"First & Last Name",
                description:"Name field for the page setting / tab personal details in the app" };
const email = { id:"app.settings.personaldetails.email",
                defaultMessage:"Email",
                description:"Email field for the page setting / tab personal details in the app" };
const dob = { id:"app.settings.personaldetails.dob",
                defaultMessage:"Date Of Birth",
                description:"Date of birth field for the page setting / tab personal details in the app" };
const phone = { id:"app.settings.personaldetails.phone",
                defaultMessage:"Phone Number",
                description:"Phone field for the page setting / tab personal details in the app" };
const address = { id:"app.settings.personaldetails.address",
                defaultMessage:"Full Address",
                description:"Address field for the page setting / tab personal details in the app" };
const button = { id:"app.settings.personaldetails.button",
                defaultMessage:"Save",
                description:"Content for the page setting / tab personal details in the app" };

export const PersonalDetails = () => {
  return (
    <div>
      <Header as="h5" className={ `appTitles` }>
        <FormattedMessage {...title} />
      </Header>
      <Form>
        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...name} />}
          name="name"/>
        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...email} />}
          name="email"/>

        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...dob} />}
          name="dob"/>
        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...phone} />}
          name="phone"/>

        <Form.Input
          className={"borderTop borderBottom"}
          label={<FormattedMessage {...address} />}
          name="address"/>

      <Header as="h5" className={ `appTitles` }>
        <FormattedMessage {...titleCurrency} />
        <Header.Subheader>
              <FormattedMessage  {...descriptionCurrency} />
            </Header.Subheader>
      </Header>
          
        <Form.Field>
          <Radio
            label='CAD'
            name='currency'
            value='cad'
          /> &nbsp;&nbsp;&nbsp;&nbsp;
          <Radio
            label='THE'
            name='currency'
            value='the'
          />
          </Form.Field>

          <ButtonTertiary>
              <FormattedMessage {...button} />
          </ButtonTertiary>
      </Form>
    </div>
  );
}


