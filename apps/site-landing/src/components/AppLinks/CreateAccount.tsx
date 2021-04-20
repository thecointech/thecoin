import React from "react";
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";
import { FormattedMessage } from "react-intl";
import { SemanticSIZES } from "semantic-ui-react";

const titleButton = {
  id: 'site.MainNavigation.button,createAccount',
  defaultMessage: 'Create Account',
  description: 'Button to create account in app'
};

export const CreateAccountButton = ({ size }: { size?: SemanticSIZES }) =>
  <ButtonPrimary as={"a"} href={`${process.env.URL_SITE_APP}/#/addAccount`} size={size}>
    <FormattedMessage {...titleButton} />
  </ButtonPrimary>

