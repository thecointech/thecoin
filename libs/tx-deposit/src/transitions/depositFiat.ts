import { getSigner } from "@thecointech/signers";
import { log } from "@thecointech/logging";
import { DepositResult, ETransferErrorCode, IBank } from "@thecointech/bank-interface";
import type { eTransferData } from "@thecointech/tx-gmail";
import { IsValidAddress, getAddressShortCode } from "@thecointech/utilities";
import Decimal from "decimal.js-light";
import { BuyActionContainer, getCurrentState, makeTransition } from "@thecointech/tx-statemachine";
import { verifyPreTransfer } from "@thecointech/tx-statemachine/transitions";
import { DateTime } from 'luxon';


export const depositFiat = makeTransition<"Buy">("depositFiat", async (container) => (
  await verifyPreTransfer(container) ?? await doDeposit(container)
))

async function doDeposit(container: BuyActionContainer) {
  const etransfer = container.instructions;
  if (etransfer == null) { return { error: "Buy action missing eTransfer instructions"}};

  // An action should not contain multiple fiat deposits
  const currentState = getCurrentState(container);
  if (currentState.data.fiat?.isZero() === false) {
    return { error: 'Cannot deposit fiat, action already has fiat balance'}
  }

  // If we are here without a bank API, it is an error
  // We should have stopped before doing preTransfer step
  const {bank} = container;
  if (!bank) return { error: 'Cannot deposit fiat, no bank API present'};

  try {
    const result = await depositInBank(etransfer, bank, log.debug);
    if (result.code != ETransferErrorCode.Success || !result.confirmation)
    {
      return { error: result.message };
    }
    // Return new balance of transaction
    return {
      fiat: new Decimal(etransfer.cad),
      meta: result.confirmation.toString(),
      date: DateTime.now(),
    }
  }
  catch (err) {
    return { error: `${err}` };
  }

}

async function depositInBank(etransfer: eTransferData, bank: IBank, progressCb: (v: string) => void) : Promise<DepositResult> {

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
  const prefix = `${name.replace(/\s+/g, "_")}/${recieved.toSQLDate()}/${DateTime.now().toISO()}`;
  const result = await bank.depositETransfer(prefix, depositUrl, code, progressCb);
  log.debug(`Deposit result: ${ETransferErrorCode[result.code]}`);
  return result;
}
