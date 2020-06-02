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
  const Box = require('3box')
  const provider = await Box.get3idConnectProvider() // recomended provider
  const box = await Box.openBox('0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658', provider)  

  //const IdentityWallet = require('identity-wallet')
  //console.log(IdentityWallet)
  const space = await box.openSpace('TheCoin')
  await space.syncDone
  //const spaceList = await Box.listSpaces('0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658')
  //const spaceData = await Box.getSpace('0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658')
  //console.log("-----SPACELIST",spaceData)
  //await space.public.set('favorite-nft', '0x123...')
  //await space.public.set('favorite-nft2', '0x124...')
  //await space.public.set('favorite-nft3', '0x125...')
  //const spaceData = await space.public.all()
  //await space.private.set('item-to-buy', '0x123...')
  //await space.private.set('number-to-buy', 22)
  //await space.private.set('employees', '"employees":[{"firstName":"John", "lastName":"Doe"},{"firstName":"Anna", "lastName":"Smith"},{"firstName":"Peter", "lastName":"Jones"}]')
  //await space.private.set('item-to-buy[1]', "<div>content</div>")
  //const spacePrivateData = await space.private.all()

  //console.log("-----SPACEDATA",spaceData,spacePrivateData)

  //const profile = await Box.getProfile("0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658")
  await box.public.set('name', 'Marie')
  const profilePublic = await box.public.all()
  console.log("-----PROFILE",profilePublic)
}

export const Create = () => {
  const intl = useIntl();
  const web3Type = getWeb3Type();
  const [count] = useState(0);

  //useEffect(() => {

    //async function get3BoxProfile() {
      //await create3Box();
    //}
    //get3BoxProfile();

  //});
  
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
