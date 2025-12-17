//import { useEffect, useState, useCallback } from 'react';
// import { authorize, finishLogin, isValid } from '@thecointech/tx-processing/deposit/auth';
// import { Input, Button } from 'semantic-ui-react';
// import { addFromGmail, initializeApi, setETransferLabel } from '@thecointech/tx-processing/deposit/addFromGmail';
// import { OAuth2Client } from 'google-auth-library';

// import { useFxRates, useFxRatesApi, IFxRates } from '@thecointech/shared/containers/FxRate';
// import { TransferList } from 'containers/TransferList/TransferList';
// import { AddSettlementDate } from '@thecointech/tx-processing/base/utils';
// import { DepositRenderer } from './DepositRenderer';
// import { useActiveAccount } from '@thecointech/redux-accounts';
// import { useAccountApi } from '@thecointech/shared/containers/Account';
// import { RbcApi, ETransferErrorCode } from '@thecointech/rbcapi';
// import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
// import messages from './messages';
// import { storeInDB, depositInBank } from '@thecointech/tx-processing/deposit/process';
// import { completeTheTransfer, InitContract } from '@thecointech/tx-processing/deposit/contract';
// import { Wallet } from 'ethers';
// import { Timestamp } from '@thecointech/utilities/firestore';
// import { PurchaseType } from '@thecointech/tx-firestore/';


export const Gmail = () => {

  // TODO: Delete this file and write an account viewer instead!
  return <h1>NOT CURRENTLY WORKING</h1>

  // const [text, setText] = useState("Loading...");
  // const [code, setCode] = useState("");
  // const [auth, setAuth] = useState(null as OAuth2Client | null);

  // const [emails, setEmails] = useState([] as DepositData[])
  // const [step2, setStep2] = useState([] as DepositData[])
  // const [deposits, setDeposits] = useState([] as DepositData[])

  // const [isProcessing, setIsProcessing] = useState(false);
  // const [messageValues, setMessageValues] = useState({
  //   step: -1,
  //   total: -1,
  //   currentAction: "Not Set"
  // })

  // const [rbcApi, setRbcApi] = useState(null as RbcApi | null)


  // const { rates } = useFxRates();
  // const fxApi = useFxRatesApi();
  // const account = useActiveAccount()!;
  // const accountApi = useAccountApi(account.address);

  // const onInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  //   setCode(event.currentTarget.value)
  // }, [setCode])

  // const onBegin = useCallback(async (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   if (auth) {
  //     // Finish login if necessary
  //     await finishLogin(auth, code);
  //     // We use the setCode to trigger the second effect below (cheap, I know, but meh)
  //     setCode("");
  //   }
  // }, [auth, code, setCode])

  // //////////////////////////////////////////////////
  // // Run-once on component load, we initiate the login process
  // useEffect(() => {
  //   // Login to Gmail
  //   InitiateLogin(setAuth, setText);
  //   // Ensure we have history
  //   if (account.history.length == 0) {
  //     accountApi.updateHistory(new Date(0), new Date())
  //   }
  //   // Initiate RBC Login
  //   const api = new RbcApi();
  //   setRbcApi(api);

  //   InitContract(account.signer as Wallet);

  // }, [setText]);

  // //////////////////////////////////////////////////
  // // If we have a valid auth, then fetch emails.
  // useEffect(() => {
  //   (async () => {
  //     if (isValid(auth)) {
  //       initializeApi(auth!);
  //       let res = await addFromGmail();
  //       setEmails(res);
  //     }
  //   })()

  // }, [auth, code, setEmails])

  // useEffect(() => {
  //   if (emails.length > 0 && rbcApi) {
  //     (async () => {
  //       console.log(`\n---- Starting Processing: ${emails.length} Records ----\n`);
  //       let r = emails;
  //       r = await addFromDB(r);
  //       r = await addFromBank(r, rbcApi);
  //       // Filter e-transfers turning up before our actual time
  //       r = r.filter(d => new Date(d.record.recievedTimestamp.seconds * 1000).getFullYear() >= 2019)
  //       r = await addSettlementDate(r, fxApi);
  //       setStep2(r)
  //     })()
  //   }
  // }, [setDeposits, emails, rbcApi])

  // useEffect(() => {
  //   if (step2.length > 0 && account.history.length > 0) {
  //     (async () => {
  //       //let r = setFiat(step2, rates)
  //       let r = await addFromBlockchain(step2, account.history, rates);
  //       setComplete(r);
  //       setDeposits(r);
  //     })()
  //   }
  // }, [setDeposits, step2, rates, account.history])


  // ////////////////////////////////////////////////////////
  // // Update Fiat as it becomes available


  // const needsAuth = !isValid(auth);
  // const btnText = needsAuth
  //   ? "Enter Code"
  //   : "Fetch Emails";

  // const markComplete = useCallback(async (index: number) => {
  //   const deposit = deposits[index];
  //   deposit.isComplete = !deposit.isComplete;
  //   setDeposits([...deposits]);

  //   setIsProcessing(true);
  //   await processSingleDeposit(deposit, 1, 1);
  //   setIsProcessing(false);
  // }, [deposits, setDeposits]);

  // const processSingleDeposit = useCallback(async (deposit: DepositData, index: number, total: number) => {

  //   if (!rbcApi)
  //     throw new Error("We are missing required connections");

  //   const setProgress = (currentAction: string) => {
  //     console.log(`${deposit.instruction.name} - ${deposit.record.recievedTimestamp.toDate().toDateString()}: ${currentAction}`)
  //     setMessageValues({
  //       step: index,
  //       total: total,
  //       currentAction,
  //     })
  //   }
  //   setProgress("Begin Processing");
  //   await processDeposit(deposit, rbcApi, setProgress);
  // }, [setIsProcessing, rbcApi, setMessageValues]);

  // const processAllDeposits = useCallback(async () => {
  //   setIsProcessing(true);
  //   for (let i = 0; i < deposits.length; i++) {
  //     await processSingleDeposit(deposits[i], i, deposits.length);
  //   }
  //   setIsProcessing(false);
  // }, [processSingleDeposit, deposits])

  // return (
  //   <div>
  //     <div>{text}</div>
  //     <Input onChange={onInput} style={{ display: needsAuth ? "block" : "none" }} />
  //     <Button onClick={onBegin} >{btnText}</Button>

  //     <TransferList
  //       transfers={deposits}
  //       render={DepositRenderer}
  //       markComplete={markComplete}
  //     />
  //     <Button onClick={processAllDeposits}>Process All</Button>
  //     <ModalOperation isOpen={isProcessing} header={messages.processingHeader} progressMessage={messages.processingInProgress} messageValues={messageValues} />
  //   </div>
  // )
}

// async function InitiateLogin(setAuth: (v: OAuth2Client) => void, setText: (v: string) => void) {
//   const auth = await authorize();
//   setAuth(auth);
//   // do we have a saved token?
//   const txt = isValid(auth)
//     ? "Fetch Emails"
//     : "Login with your browser";
//   setText(txt);
//   // The user is next expected to click onBegin
// }

// async function addSettlementDate(deposits: DepositData[], fxApi: IFxRates) {
//   for (let i = 0; i < deposits.length; i++) {
//     const d = deposits[i];
//     await AddSettlementDate(d.record, fxApi)
//   }
//   return deposits;
// }

// function setComplete(deposit: DepositData[]) {
//   deposit.forEach(d => {
//     d.isComplete =
//       (d.tx != null) &&
//       (d.bank != null || d.record.type == PurchaseType.other);
//   })
// }
// //////////////////////////////////////////////////////


// export async function processDeposit(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) {
//   // We assume types of 'other' (wages) were successfully deposited
//   let wasDeposited = deposit.record.type === PurchaseType.other || !!deposit.bank;

//   if (deposit.isComplete) {
//     if (deposit.instruction.raw && !wasDeposited) {
//       // This deposit should be successful, but hasn't been deposited yet.
//       wasDeposited = await doDeposit(deposit, rbcApi, progressCb)
//     }

//     if (!deposit.tx) {
//       if (wasDeposited) {
//         // Complete this deposit (send $$ to user)
//         const tx = await completeTheTransfer(deposit);
//         deposit.record.completedTimestamp = Timestamp.now();
//         deposit.tx = tx;
//         deposit.record.hash = tx.txHash!;
//       }
//       else {
//         // Remove the completed timestamp
//         progressCb('Skipping TheCoin transfer because deposit not completed');
//         deposit.record.completedTimestamp = undefined;
//       }
//     }
//     else if (!wasDeposited) {
//       alert('We have a completed deposit that seems invalid');
//       deposit.record.completedTimestamp = undefined;
//     }
//     if (deposit.record.hash) {
//       progressCb('Storing Deposit in DB');
//       await storeInDB(deposit.instruction.address, deposit.record);
//     }
//   }
//   if (deposit.instruction.raw) {
//     await setETransferLabel(deposit.instruction.raw, wasDeposited ? "deposited" : "rejected");
//   }
//   progressCb('Completed deposit');
// }

// export async function doDeposit(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) {
//   progressCb("Depositing in Bank");
//   const response = await depositInBank(deposit, rbcApi, progressCb);

//   if (response.code !== ETransferErrorCode.Success) {
//     if (response.code === ETransferErrorCode.AlreadyDeposited) {
//       console.warn(`Deposit from ${deposit.instruction.name} already deposited, but missing from bank`);
//     }
//     else {
//       alert("Could not deposit: " + response?.message);
//       return false;
//     }
//   }
//   return true;
// }
