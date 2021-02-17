import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Header } from 'semantic-ui-react';

const title = { id:"app.settings.title",
                defaultMessage:"Personal Details",
                description:"Title for the page setting / tab personal details in the app" };
const name = { id:"app.settings.name",
                defaultMessage:"First & Last Name",
                description:"Name field for the page setting / tab personal details in the app" };
const email = { id:"app.settings.email",
                defaultMessage:"Email",
                description:"Email field for the page setting / tab personal details in the app" };
const dob = { id:"app.settings.dob",
                defaultMessage:"Date Of Birth",
                description:"Date of birth field for the page setting / tab personal details in the app" };
const phone = { id:"app.settings.phone",
                defaultMessage:"Phone Number",
                description:"Phone field for the page setting / tab personal details in the app" };
const address = { id:"app.settings.address",
                defaultMessage:"Full Address",
                description:"Address field for the page setting / tab personal details in the app" };
const button = { id:"app.settings.button",
                defaultMessage:"Save",
                description:"Content for the page setting / tab personal details in the app" };

export const PersonalDetails = () => {
  return (
    <div>
      <Header as="h5">
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

          <ButtonTertiary>
              <FormattedMessage {...button} />
          </ButtonTertiary>
      </Form>
    </div>
  );
}


