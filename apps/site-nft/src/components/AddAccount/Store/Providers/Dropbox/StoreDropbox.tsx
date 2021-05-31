import React from "react";
import { FormattedMessage } from "react-intl";


const dropbox = { id:"app.storeOnline.dropbox.link", 
                defaultMessage:"Dropbox",
                description:"Title for Dropbox"};

export const StoreDropbox : React.FC = (props) => {

    return (
      <a href="addAccount/store">
        {props.children}
        <FormattedMessage {...dropbox} />
      </a>
    );
  }