import React from "react";
import { FormattedMessage } from "react-intl";

export const StoreDropbox : React.FC = (props) => {

    return (
      <a href="addAccount/store">
        {props.children}
        <FormattedMessage 
            id="site.storeOnline.dropbox.link"
            defaultMessage="Dropbox"
            description=""/>
      </a>
    );
  }