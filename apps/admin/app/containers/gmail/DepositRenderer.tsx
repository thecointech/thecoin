import React from "react";
import { TransferData } from "containers/TransferList/types";
import { DepositData } from "./types";
import { Segment, Select } from "semantic-ui-react";


export const DepositRenderer = (props: TransferData) => {
  const deposit = props as DepositData;
  const { instruction, record } = deposit;


  return (
    <Segment>
    <div>Name: {instruction.name} - {record.type}</div>
    <div>Address: {instruction.address}</div>

    <div>
    {
      deposit.instruction.raw 
        ? `Email Recieved on: ${deposit.instruction.recieved?.toDateString()}`
        : "Warning: No matching email"
    }
    </div>
    <div>
    {
      deposit.bank 
        ? `Deposited on: ${deposit.bank.Date.toDateString()}`
        : "Warning: Could not find deposit"
    }
    </div>
    <div>
    {
      deposit.tx 
        ? `Tx Hash: ${deposit.tx.txHash}`
        : "Warning: No hash present"
    }
    </div>
    <TxSelect deposit={deposit} />
  </Segment>
  )
}

type TxSelectProps = {
  deposit: DepositData;
}
const TxSelect = ({deposit}: TxSelectProps) => {
  const {db} = deposit;
  if (Array.isArray(db)) {
    const options = db.map((dep, index) => (
      {
        key: dep.txHash,
        value: index,
        text: `$${dep.fiat} - ${dep.settled.toDate().toDateString()}`
      }))
    return db.length > 0 
      ? <Select placeholder="Select a TX" options={options} />
      : null;
  }
  else {
    return (
      <div>
      { 
        db
        ? `Db Stored: ${db.txHash}`
        : "Warning: No DB found"
      }
      </div>
    )
  }
}
