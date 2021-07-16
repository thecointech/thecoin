import React from "react";
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";
import { defineMessages, FormattedMessage } from "react-intl";
import { SemanticSIZES } from "semantic-ui-react";

const translations = defineMessages({
    titleButton : {
      defaultMessage: 'Create Account',
      description: 'site.MainNavigation.button,createAccount: Button to create account in app'}
  });

export const CreateAccountButton = ({ size }: { size?: SemanticSIZES }) =>
  <ButtonPrimary as={"a"} href={`${process.env.URL_SITE_APP}/#/addAccount`} size={size}>
    <FormattedMessage {...translations.titleButton} />
  </ButtonPrimary>

