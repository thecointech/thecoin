//import {googleSignIn} from './auth'
import React, { useEffect, useState, useCallback } from 'react';
import { authorize, finishLogin, isValid } from './auth';
import { Input, Button } from 'semantic-ui-react';
import { addFromGmail } from './addFromGmail';
import { DepositData } from './types';
import { OAuth2Client } from 'google-auth-library';

import { useFxRates, useFxRatesApi, IFxRates } from '@the-coin/shared/containers/FxRate';
import { TransferList } from 'containers/TransferList/TransferList';
import { AddSettlementDate } from 'containers/TransferList/utils';
import { DepositRenderer } from './DepositRenderer';
import { addFromDB } from './addFromDB';
import { addFromBank } from './addFromBank';
import { addFromBlockchain } from './addFromBlockchain';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { useAccountApi } from '@the-coin/shared/containers/Account';


export const Gmail = () => {

  const [text, setText] = useState("Loading...");
  const [code, setCode] = useState("");
  const [auth, setAuth] = useState(null as OAuth2Client|null);

  const [emails, setEmails] = useState([] as DepositData[])
  const [step2, setStep2] = useState([] as DepositData[])
  const [deposits, setDeposits] = useState([] as DepositData[])

  const {rates} = useFxRates();
  const fxApi = useFxRatesApi();
  const account = useActiveAccount();
  const accountApi = useAccountApi(account.address);

  const onInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.currentTarget.value)
  }, [setCode])

  const onBegin = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
    // Finish login if necessary
    await finishLogin(auth, code);
    // We use the setCode to trigger the second effect below (cheap, I know, but meh)
    setCode("");
  }, [auth, code, setCode])
  
  //////////////////////////////////////////////////
  // First, we initiate the login process
  useEffect(() => { 
    InitiateLogin(setAuth, setText);
    // Ensure we have history
    if (account.history.length == 0) {
      accountApi.updateHistory(new Date(0), new Date())
    }
  }, [setText]);

  //////////////////////////////////////////////////
  // If we have a valid auth, then fetch emails.

  useEffect(() => {
    if (isValid(auth)) {
      addFromGmail(auth)
        .then(setEmails)
        .catch(console.error)
    }
  }, [auth, code, setEmails])

  useEffect(() => {
    if (emails.length > 0) {
      (async () => {
        console.log(`\n---- Starting Processing: ${emails.length} Records ----\n`);
        let r = emails;
        r = await addFromDB(r);
        r = await addFromBank(r);
        r = await addSettlementDate(r, fxApi);
        setStep2(r)
      })()
    }
  }, [setDeposits, emails, rates, account.history])

  useEffect(() => {
    if (step2.length > 0 && account.history.length > 0) {
      (async () => {
        //let r = setFiat(step2, rates)
        let r = await addFromBlockchain(step2, account.history, rates);
        setComplete(r);
        setDeposits(r);
      })()
    }
  }, [setDeposits, step2, rates, account.history])


  ////////////////////////////////////////////////////////
  // Update Fiat as it becomes available


  const needsAuth = !isValid(auth);
  const btnText = needsAuth
    ? "Enter Code"
    : "Fetch Emails";

  const markComplete = useCallback((index: number) => {
    console.log("completing: " + index);
  }, [deposits]);

  return (
    <div>
      <div>{text}</div>
      <Input onChange={onInput} style={{display: needsAuth ? "block" : "none"}}/>
      <Button onClick={onBegin} >{btnText}</Button>

      <TransferList 
        transfers={deposits} 
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

// function setFiat(emails: DepositData[], rates: FXRate[]) {
//   const withCoin: DepositData[] = emails.map(r => ({
//     ...r,
//     record: {
//       ...r.record,
//       transfer: {
//         value: r.record.transfer.value <= 0 
//           ? calcCoin(r.record, rates) 
//           : r.record.transfer.value
//       }
//     }
//   }))
//   return withCoin;
// }

function setComplete(deposit: DepositData[]) {
  deposit.forEach(d => {
    d.isComplete = d.bank != null && d.tx != null;
  })
}
//////////////////////////////////////////////////////
