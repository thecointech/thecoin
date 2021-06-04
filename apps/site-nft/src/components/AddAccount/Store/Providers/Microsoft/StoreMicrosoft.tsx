import React from "react";
import { FormattedMessage } from "react-intl";

export const StoreMicrosoft : React.FC = (props) => {

    return (
      <a href="">
        {props.children}
        <FormattedMessage 
            id="app.storeOnline.microsoft.link"
            defaultMessage="Microsoft"
            description=""/>
      </a>
    );
  }