import React from "react";
import { FormattedMessage } from "react-intl";

export const StoreLocaly : React.FC = (props) => {

    return (
      <a href="google.com">
        {props.children}
        <FormattedMessage 
            id="site.storeOnline.localy.link"
            defaultMessage="Localy"
            description=""/>
      </a>
    );
  }