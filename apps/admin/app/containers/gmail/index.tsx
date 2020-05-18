//import {googleSignIn} from './auth'
import React, { useEffect, useState, useCallback } from 'react';
import { authorize, finishLogin, isValid } from '../../autodeposit/auth';
import { Input, Button } from 'semantic-ui-react';
import { addFromGmail, initializeApi } from '../../autodeposit/addFromGmail';
import { DepositData } from '../../autodeposit/types';
import { OAuth2Client } from 'google-auth-library';

import { useFxRates, useFxRatesApi, IFxRates } from '@the-coin/shared/containers/FxRate';
import { TransferList } from 'containers/TransferList/TransferList';
import { AddSettlementDate } from 'containers/TransferList/utils';
import { DepositRenderer } from './DepositRenderer';
import { addFromDB } from '../../autodeposit/addFromDB';
import { addFromBank } from '../../autodeposit/addFromBank';
import { addFromBlockchain } from '../../autodeposit/addFromBlockchain';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { useAccountApi } from '@the-coin/shared/containers/Account';
import { RbcApi } from 'RbcApi';
import { PurchaseType } from 'containers/TransferList/types';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import messages from './messages';
import { processDeposit } from 'autodeposit';


export const Gmail = () => {

  const [text, setText] = useState("Loading...");
  const [code, setCode] = useState("");
  const [auth, setAuth] = useState(null as OAuth2Client | null);

  const [emails, setEmails] = useState([] as DepositData[])
  const [step2, setStep2] = useState([] as DepositData[])
  const [deposits, setDeposits] = useState([] as DepositData[])

  const [isProcessing, setIsProcessing] = useState(false);
  const [messageValues, setMessageValues] = useState({
    step: -1,
    total: -1,
    currentAction: "Not Set"
  })

  const [rbcApi, setRbcApi] = useState(null as RbcApi)


  const { rates } = useFxRates();
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
    // Login to Gmail
    InitiateLogin(setAuth, setText);
    // Ensure we have history
    if (account.history.length == 0) {
      accountApi.updateHistory(new Date(0), new Date())
    }
    // Initiate RBC Login
    const api = new RbcApi();
    setRbcApi(api);

  }, [setText]);

  //////////////////////////////////////////////////
  // If we have a valid auth, then fetch emails.

  useEffect(() => {
    (async () => {
      if (isValid(auth)) {
        initializeApi(auth);
        let res = await addFromGmail();
        setEmails(res);
      }
    })()

  }, [auth, code, setEmails])

  useEffect(() => {
    if (emails.length > 0) {
      (async () => {
        console.log(`\n---- Starting Processing: ${emails.length} Records ----\n`);
        let r = emails;
        r = await addFromDB(r);
        r = await addFromBank(r, rbcApi);
        r = await addSettlementDate(r, fxApi);
        setStep2(r)
      })()
    }
  }, [setDeposits, emails, rbcApi])

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

  const markComplete = useCallback(async (index: number) => {
    const deposit = deposits[index];
    deposit.isComplete = !deposit.isComplete;
    setDeposits([...deposits]);

    setIsProcessing(true);
    await processSingleDeposit(deposit, 1, 1);
    setIsProcessing(false);
  }, [deposits, setDeposits]);

  const processSingleDeposit = useCallback(async (deposit: DepositData, index: number, total: number) => {
    const setProgress = (currentAction: string) => {
      console.log(`${deposit.instruction.name} - ${deposit.record.recievedTimestamp.toDate().toDateString()}: ${currentAction}`)
      setMessageValues({
        step: index,
        total: total,
        currentAction,
      })
    }
    setProgress("Begin Processing");
    await processDeposit(deposit, rbcApi, account.contract, setProgress);
  }, [setIsProcessing, account, rbcApi, setMessageValues]);

  const processAllDeposits = useCallback(async () => {
    setIsProcessing(true);
    for (let i = 0; i < deposits.length; i++) {
      await processSingleDeposit(deposits[i], i, deposits.length);
    }
    setIsProcessing(false);
  }, [processSingleDeposit, deposits])

  return (
    <div>
      <div>{text}</div>
      <Input onChange={onInput} style={{ display: needsAuth ? "block" : "none" }} />
      <Button onClick={onBegin} >{btnText}</Button>

      <TransferList
        transfers={deposits}
        render={DepositRenderer}
        markComplete={markComplete}
      />
      <Button onClick={processAllDeposits}>Process All</Button>
      <ModalOperation isOpen={isProcessing} header={messages.processingHeader} progressMessage={messages.processingInProgress} messageValues={messageValues} />
    </div>
  )
}

async function InitiateLogin(setAuth: (v: OAuth2Client) => void, setText: (v: string) => void) {
  const auth = await authorize();
  setAuth(auth);
  // do we have a saved token?
  const txt = isValid(auth)
    ? "Fetch Emails"
    : "Login with your browser";
  setText(txt);
  // The user is next expected to click onBegin
}

async function addSettlementDate(deposits: DepositData[], fxApi: IFxRates) {
  for (let i = 0; i < deposits.length; i++) {
    const d = deposits[i];
    await AddSettlementDate(d.record, fxApi)
  }
  return deposits;
}

function setComplete(deposit: DepositData[]) {
  deposit.forEach(d => {
    d.isComplete =
      (d.tx != null) &&
      (d.bank != null || d.record.type == PurchaseType.other);
  })
}
//////////////////////////////////////////////////////
