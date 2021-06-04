import { getSigner } from "@thecointech/accounts";
import { log } from "@thecointech/logging";
import { DepositResult, ETransferErrorCode, RbcApi } from "@thecointech/rbcapi";
import { eTransferData } from "@thecointech/tx-gmail";
import { IsValidAddress, getAddressShortCode } from "@thecointech/utilities";
import Decimal from "decimal.js-light";
import { BuyActionContainer, getCurrentState } from "../statemachine/types";
import { verifyPreTransfer } from "./verifyPreTransfer";

//
// Deposit an eTransfer and update fiat balance
export async function depositFiat(container: BuyActionContainer) {
  return verifyPreTransfer(container) ?? await doDeposit(container);
}

async function doDeposit(container: BuyActionContainer) {
  const etransfer = container.instructions;
  if (etransfer == null) { return { error: "Buy action missing eTransfer instructions"}};

  // An action should not contain multiple fiat deposits
  const currentState = getCurrentState(container);
  if (currentState.data.fiat?.isZero() === false) {
    return { error: 'Cannot deposit fiat, action already has fiat balance'}
  }

  const bank = new RbcApi();
  const result = await depositInBank(etransfer, bank, log.trace);
  if (result.code != ETransferErrorCode.Success || !result.confirmation)
  {
    return { error: result.message };
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
  const code = await getAddressShortCode(address, bta);
  const prefix = `${name}/${recieved.toSQLDate()}`;
  const result = await rbcApi.depositETransfer(prefix, depositUrl, code, progressCb);
  log.debug(`Deposit result: ${ETransferErrorCode[result.code]}`);
  return result;
}