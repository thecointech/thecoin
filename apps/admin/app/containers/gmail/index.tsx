//import {googleSignIn} from './auth'
import React, { useEffect, useState, useCallback } from 'react';
import { authorize, finishLogin, isValid } from './auth';
import { Input, Button } from 'semantic-ui-react';
import { addFromGmail, setETransferLabel, initializeApi } from './addFromGmail';
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
import { useAccountApi, Transaction } from '@the-coin/shared/containers/Account';
import { RbcApi, ETransferErrorCode } from 'RbcApi';
import { GetAccountCode } from 'containers/BrokerTransferAssistant/Wallet';
import { DepositRecord, PurchaseType } from 'containers/TransferList/types';
import { GetActionDoc } from '@the-coin/utilities/User';
import { Contract } from 'ethers';
import { ModalOperation } from '../../../../../libs/shared/src/containers/ModalOperation';
import messages from './messages';


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
  }, [setDeposits, emails, rates, account.history, rbcApi])

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
    d.isComplete = d.bank != null && d.tx != null;
  })
}
//////////////////////////////////////////////////////

async function processDeposit(deposit: DepositData, rbcApi: RbcApi, contract: Contract, progressCb: (v: string) => void) {
  // We assume types of 'other' (wages) were successfully deposited
  let wasDeposited = deposit.record.type === PurchaseType.other || !!deposit.bank;

  if (deposit.isComplete) {
    if (deposit.instruction.raw && !wasDeposited) {
      // This deposit should be successful, but hasn't been deposited yet.
      wasDeposited = await depositInBank(deposit, rbcApi, progressCb)
    }

    if (!deposit.tx) {
      if (wasDeposited) {
        // Complete this deposit (send $$ to user)
        deposit.tx = await completeTheTransfer(deposit, contract, progressCb);
        deposit.record.hash = deposit.tx.txHash;
      }
      else {
        // Remove the completed timestamp
        progressCb('Skipping TheCoin transfer because deposit not completed');
        deposit.record.completedTimestamp = null;
      }
    }
    else if (!wasDeposited) {
      alert('We have a completed deposit that seems invalid');
      deposit.record.completedTimestamp = null;
    }
    if (deposit.record.hash) {
      progressCb('Storing Deposit in DB');
      await storeInDB(deposit.instruction.address, deposit.record);  
    }
  }
  if (deposit.instruction.raw)
  {
    await setETransferLabel(deposit.instruction.raw, wasDeposited ? "deposited" : "rejected");
  }
  progressCb('Completed deposit');
}

async function depositInBank(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) {
  progressCb("Depositing in Bank");
  const { instruction, record } = deposit;
  const recieved = record.recievedTimestamp.toDate().toDateString();
  const code = await GetAccountCode(instruction.address)
  const prefix = `${instruction.name}/${recieved}`;
  const response = await rbcApi.depositETransfer(prefix, instruction.depositUrl, code, progressCb);
  if (response.code !== ETransferErrorCode.Success) {
    if (response.code === ETransferErrorCode.AlreadyDeposited)
    {
      console.warn(`Deposit from ${instruction.name} - ${recieved} already deposited, but missing from bank`);
    }
    else {
      alert("Could not deposit: " + response.message);
      return false;
    }
  }
  return true;
}

async function storeInDB(address: string, record: DepositRecord) {
  const userDoc = await GetActionDoc(address, "Buy", record.hash);

  // const purchaseData = await purchaseDoc.get()
  // if (purchaseData.exists) {
  //   throw new Error(`Purchase ${purchaseId} already exists: check tx ${JSON.stringify(purchaseData.data())}`)
  // }

  var result = await userDoc.set(record);
  if (result) {
    console.log(result.writeTime);
  }
}

async function completeTheTransfer(deposit: DepositData, contract: Contract, progressCb: (v: string) => void) : Promise<Transaction>
{
  progressCb('Beginning TheCoin transfer');
  const {record, instruction} = deposit;
  const {address} =instruction;
  const tx = await contract.coinPurchase(
    address, 
    record.transfer.value, 
    0, 
    record.processedTimestamp.seconds
  );
  progressCb('Awaiting TheCoin transfer:\n' + tx.hash);
  await tx.wait();
  return { 
    balance: -1,
    change: -record.transfer.value,
    counterPartyAddress: address,
    date: new Date(),
    logEntry: "We just sent it",
    txHash: tx.hash,
  }
}