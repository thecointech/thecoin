import React from "react";
import { Segment } from "semantic-ui-react";
import { TransactionData } from "containers/TransferList";
import { DepositRecord } from "@the-coin/tx-firestore";
import { eTransferData } from "@the-coin/tx-gmail/";

export const DepositRenderer = (props : TransactionData) => {

  const record = props.record as DepositRecord;
  const instructions = props.instruction as eTransferData;
  return (
    <Segment>
    <div>Name: {instructions.name} - {record.type}</div>
    <div>Address: {instructions.address}</div>
    <div>
    {
      instructions.raw
        ? `Email Recieved on: ${instructions.recieved?.toSQLDate()}`
        : "Warning: No matching email"
    }
    </div>
    <div>Completed: {record.completedTimestamp?.toDate().toString()}</div>
    {/* <div>
    {
      deposit.bank
        ? `Deposited on: ${deposit.bank.Date.toFormat("DD")}`
        : "Warning: Could not find deposit"
    }
    </div>
    <div>
    {
      deposit.tx
        ? `Tx Hash: ${deposit.tx.txHash}`
        : "Warning: No hash present"
    }
    </div> */}
  </Segment>
  )
}

// type TxSelectProps = {
//   deposit: DepositData;
// }
// const TxSelect = ({deposit}: TxSelectProps) => {
//   const {db} = deposit;
//   if (Array.isArray(db)) {
//     const options = db.map((dep, index) => (
//       {
//         key: dep.hash,
//         value: index,
//         text: `$${dep.fiatDisbursed} - ${dep.processedTimestamp?.toDate().toDateString()}`
//       }))
//     return db.length > 0
//       ? <Select placeholder="Select a TX" options={options} />
//       : null;
//   }
//   else {
//     return (
//       <div>
//       {
//         db
//         ? `Db Stored: ${db.hash}`
//         : "Warning: No DB found"
//       }
//       </div>
//     )
//   }
// }
