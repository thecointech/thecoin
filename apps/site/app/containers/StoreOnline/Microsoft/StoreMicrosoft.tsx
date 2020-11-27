import React from "react";
import { FormattedMessage } from "react-intl";

export const StoreMicrosoft : React.FC = (props) => {

    return (
      <a href="">
        {props.children}
        <FormattedMessage 
            id="site.storeOnline.microsoft.link"
            defaultMessage="Microsoft"
            description=""/>
      </a>
    );
  }