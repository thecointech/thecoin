import { AnyActionContainer } from "../types";
import { SendMail } from '@thecointech/email';
//import { removeIncomplete } from '@thecointech/broker-db'

//
// Something has gone wrong, and we can't handle it automatically.
// Send a notification email to request manual overview.
export async function requestManual(action: AnyActionContainer) {
  // Send an email to request manual intervention
  await SendMail(
    `Manual attention required: ${action.action.type}`,
    `InitialId: ${action.action.data.initialId}\n` +
    `Recieved: ${action.action.data.date.toSQLDate()}\n` +
    `History:\n ${printHistory(action)}\n`
  );

  // Remove from our list of active transctions(?)
  // TODO: For now we leave failed tx's in the incomplete list
  // Until they are dealt with we should be reminded that they are not completed
  //await removeIncomplete(action.action.type, action.action.doc);
  // Make no state changes.
  return {};
}

const printHistory = (action: AnyActionContainer) =>
  action.history.map(h => {
    const { name, delta } = h;
    const sb = [
      `${delta.created.toString()}`,
      `${delta.date?.toString()}`,
      `${delta.type} ==> ${name}`,
    ]
    if (delta.meta) sb.push(`meta: ${delta.meta}`);
    if (delta.error) sb.push(`error: ${delta.error}`);
    if (delta.coin) sb.push(`coin: ${delta.coin.toString()}`);
    if (delta.fiat) sb.push(`fiat: ${delta.fiat.toString()}`);
    if (delta.hash) sb.push(`hash: ${delta.hash}`);
    return sb.map(s => `    ${s}`).join('\n');
  }).join('\n');
