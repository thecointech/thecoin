import React from "react";
import { FormattedMessage } from "react-intl";
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';

const dropbox = { id:"app.storeOnline.dropbox.link", 
                defaultMessage:"Dropbox",
                description:"Title for Dropbox"};

export const StoreDropbox : React.FC = (props) => {

    return (
      <>
          {props.children}
          <br />
          <ButtonPrimary href="">
            <FormattedMessage 
                id="app.storeOnline.microsoft.link"
                defaultMessage="Microsoft"
                description=""/>
          </ButtonPrimary>
      </>
    );
  }