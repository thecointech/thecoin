import React, { useCallback, useState, useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { ConnectWeb3 } from '@the-coin/shared/containers/Account/Web3';
import { FormattedMessage } from 'react-intl';
import { WarnIfDisabled } from './WarnIfDisabled';
import { NameInput } from '../NewBaseClass/NameInput';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import messages from '../messages';
import { TheSigner } from '@the-coin/shared/SignerIdent';
import { IAccountMapActions, useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import { useHistory } from 'react-router';

const Box = require('3box')



async function create3Box(){
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
  await box.public.set('name', 'Test')
  const profilePublic = await box.public.all()
  console.log("-----PROFILE",profilePublic)
}

async function get3Box(){
  const provider = await Box.get3idConnectProvider() // recomended provider
  return await Box.openBox('0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658', provider)  
}

async function setProfil(){

}

async function getProfile(){
  return await box.public.all()
}


export const Connect = () => {

  const [name, setName] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [forceValidate, setForceValidate] = useState(false);

  const accountsApi = useAccountMapApi();
  const history = useHistory();
  const onConnect = useCallback(async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!(referral && name)) {
      setForceValidate(true);
      return false;
    }
    const theSigner = await ConnectWeb3();
    if (theSigner) {
      storeSigner(theSigner, name, referral, accountsApi);
      // We redirect directly to the now-active account
      history.push('/accounts');
    }

    return true;
  }, [referral, name, setForceValidate, accountsApi, history]);


  useEffect(() => {

    async function get3BoxProfile() {
      await create3Box();
    }
    get3BoxProfile();

  });

  return (
    <>
      <WarnIfDisabled />
      <Form>
        <NameInput forceValidate={forceValidate} setName={setName} />
        <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        <Button onClick={onConnect} id="buttonCreateAccountStep1">
          <FormattedMessage {...messages.buttonCreate} />
        </Button>
      </Form>
    </>
  );
}

const storeSigner = async (wallet: TheSigner, name: string, referralCode: string, accountsApi: IAccountMapActions) => {
  accountsApi.addAccount(name, wallet, true);
  accountsApi.setActiveAccount(wallet.address)
  registerReferral(wallet.address, referralCode);  
}