import React, { useEffect, useState } from "react"
import { Connect } from "../../Connect"
import { FormattedMessage, useIntl } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider, Message } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { getWeb3Type } from "@the-coin/shared/utils/detection"

const BounceLink = () => 
  <Link to="/addAccount/generate/">
    <FormattedMessage {...messages.createTransfer} />
  </Link>


async function create3Box(){
  console.log("-----create3Box")
  const Box = require('3box')
  const provider = await Box.get3idConnectProvider() // recomended provider
  const box = await Box.openBox('0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658', provider)  
  console.log(box)
  //const space = await box.openSpace('TheCoin')
  //console.log("-----SPACE",space)
  //const profile = await Box.getProfile("0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658")
  //console.log("-----PROFILE",profile)
}

export const Create = () => {
  const intl = useIntl();
  const web3Type = getWeb3Type();
  const [count] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;

    async function get3BoxProfile() {
      document.title = `You clicked ${count} times`;
      await create3Box();
    }
    get3BoxProfile();

  });
  
  return (
    <Container id="formCreateAccountStep1">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>

      {
        (web3Type === "Opera") &&
          <Message
            info
            header={intl.formatMessage(messages.checkHeader)}
            content={intl.formatMessage(messages.checkMessageOpera)}
          />
      }
      {
        !web3Type &&
          <Message
            warning
            header={intl.formatMessage(messages.checkHeaderFailed)}
            content={intl.formatMessage(messages.checkMessageFailed)}
          />
      }

      <Connect />
      <Divider text="Or"/>
      <BounceLink />
    </Container>
  );
}
