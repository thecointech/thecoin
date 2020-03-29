//import {googleSignIn} from './auth'
import React, { useEffect, useState, useCallback } from 'react';
import { authorize, finishLogin, isValid } from './auth';
import { Input, Button } from 'semantic-ui-react';
import { fetchDepositEmails } from './gmailBridge';
import { DepositData } from './types';
import { OAuth2Client } from 'google-auth-library';

import { useFxRates, useFxRatesApi, IFxRates } from '@the-coin/shared/containers/FxRate';
import { TransferList } from 'containers/TransferList/TransferList';
import { calcCoin, AddSettlementDate } from 'containers/TransferList/utils';
import { DepositRenderer } from './DepositRenderer';


export const Gmail = () => {

  const [text, setText] = useState("Loading...");
  const [code, setCode] = useState("");
  const [auth, setAuth] = useState(null as OAuth2Client|null);
  const [completeIndex, setCompleteIndex] = useState(-1);

  const [emails, setEmails] = useState([] as DepositData[])

  const {rates} = useFxRates();

  const onInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.currentTarget.value)
  }, [setCode])

  const onBegin = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
    // Finish login if necessary
    await finishLogin(auth, code);
    // We use the setCode to trigger the second effect below (cheap, I know, but meh)
    setCode("");
  }, [auth, code, setCode])

  // const onProcess = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   const dataIndex = event.currentTarget.getAttribute("data-index");
  //   const index = parseInt(dataIndex);
  //   processDeposit(emails[index])
  // }, [emails]);
  
  //////////////////////////////////////////////////
  // First, we initiate the login process
  useEffect(() => { InitiateLogin(setAuth, setText) }, [setText]);

  //////////////////////////////////////////////////
  // If we have a valid auth, then fetch emails.
  const fxApi = useFxRatesApi();
  useEffect(() => {
    if (isValid(auth)) {
      fetchDepositEmails(auth)
        .then(r => addSettlementDate(r, fxApi))
        .then(setEmails)
        .then(() => setCompleteIndex(-2))
        .catch(alert)
    }
  }, [auth, code, setEmails])

  ////////////////////////////////////////////////////////
  // Update Fiat as it becomes available
  useEffect(() => {
    const withCoin: DepositData[] = emails.map(r => ({
      ...r,
      record: {
        ...r.record,
        transfer: {
          value: calcCoin(r.record, rates)
        }
      }
    }))
    setEmails(withCoin)
  }, [rates, completeIndex])

  const needsAuth = !isValid(auth);
  const btnText = needsAuth
    ? "Enter Code"
    : "Fetch Emails";

  const markComplete = useCallback((index: number) => {
    console.log("completing: " + index);
  }, [emails]);

  return (
    <div>
      <div>{text}</div>
      <Input onChange={onInput} visible={needsAuth}/>
      <Button onClick={onBegin} >{btnText}</Button>

      <TransferList 
        transfers={emails} 
        render={DepositRenderer}
        markComplete={markComplete}
        />
    </div>
    
  )
}

async function InitiateLogin(setAuth: (v: OAuth2Client) => void, setText: (v: string) => void)
{
  const auth = await authorize();
  setAuth(auth);
  // do we have a saved token?
  const txt = isValid(auth)
    ? "Fetch Emails"
    : "Login with your browser";
  setText(txt);
  // The user is next expected to click onBegin
}

async function addSettlementDate(deposits: DepositData[], fxApi: IFxRates) 
{
  for (let i = 0; i < deposits.length; i++) {
    const d = deposits[i];
    await AddSettlementDate(d.record, fxApi)
  }
  return deposits;
}
//////////////////////////////////////////////////////
