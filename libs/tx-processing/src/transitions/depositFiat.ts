import { getSigner } from "@thecointech/accounts";
import { log } from "@thecointech/logging";
import { DepositResult, ETransferErrorCode, RbcApi } from "@thecointech/rbcapi";
import { eTransferData } from "@thecointech/tx-gmail";
import { IsValidAddress } from "@thecointech/utilities";
import { GetAccountCode } from "@thecointech/utilities/Referrals";
import Decimal from "decimal.js-light";
import { getCurrentState, TransitionCallback } from "../statemachine/types";
import { verifyPreTransfer } from "./verifyPreTransfer";

//
// Deposit an eTransfer and update fiat balance
export const depositFiat : TransitionCallback = async (container) =>
  verifyPreTransfer(container) ?? doDeposit(container);


const doDeposit : TransitionCallback = async (container) => {
  // TODO: Throw if we already have fiat
  const currentState = getCurrentState(container);
  if (currentState.data.fiat?.isZero() === false) {
    return { error: 'invalid state: a balance is already assigned to this transaction'}
  }

  const etransfer = container.source as eTransferData;
  const bank = new RbcApi();
  const result = await depositInBank(etransfer, bank, log.trace);
  if (result.code != ETransferErrorCode.Success || !result.confirmation)
  {
    log.error({address: etransfer.address, errorCode: ETransferErrorCode[result?.code ?? ETransferErrorCode.UnknownError]},
      `Could not process deposit from: {address}, got {errorCode}`);
    return {
      error: result.message
    };
  }
  // Return new balance of transaction
  return {
    fiat: new Decimal(etransfer.cad),
    meta: result.confirmation.toString()
  }
}

async function depositInBank(etransfer: eTransferData, rbcApi: RbcApi, progressCb: (v: string) => void) : Promise<DepositResult> {

  const {address, name, depositUrl, cad, recieved } = etransfer;
  log.debug(`Attempting deposit of: $${cad}, recieved on ${recieved.toSQLDate()}`);

  if (!address || !IsValidAddress(address))
  {
    return {
      message: "Cannot complete deposit without a valid address",
      code: ETransferErrorCode.InvalidInput
    }
  }
  if (!depositUrl)
  {
    return {
      message: "Cannot complete deposit without a depositUrl",
      code: ETransferErrorCode.InvalidInput
    }
  }

  const bta = await getSigner("BrokerTransferAssistant");
  const code = await GetAccountCode(address, bta);
  const prefix = `${name}/${recieved.toSQLDate()}`;
  const result = await rbcApi.depositETransfer(prefix, depositUrl, code, progressCb);
  log.debug(`Deposit result: ${ETransferErrorCode[result.code]}`);
  return result;
}
