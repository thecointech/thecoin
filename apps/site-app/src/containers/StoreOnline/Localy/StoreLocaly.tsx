import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

const translations = defineMessages({
  link : {
      defaultMessage: 'Localy',
      description: 'app.storeOnline.localy.link'}
});

export const StoreLocaly : React.FC = (props) => {

    return (
      <a href="google.com">
        {props.children}
        <FormattedMessage {...translations.link} />
      </a>
    );
  }