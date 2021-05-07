import { AnyActionContainer } from "statemachine/types";
import { SendMail } from '@thecointech/email';
import { removeIncomplete } from '@thecointech/broker-db'

//
// Something has gone wrong, and we can't handle it automatically.
// Send a notification email to request manual overview.
export async function requestManual(action: AnyActionContainer) {
  // Send an email to request manual intervention
  await SendMail(
    `Manual attention required: ${action.action.type}`,
    `InitialId: ${action.action.data.initialId}\n` +
    `Recieved: ${action.action.data.timestamp.toSQLDate()}\n` +
    `History:\n ${printHistory(action)}\n`
  );

  // Remove from our list of active transctions(?)
  await removeIncomplete(action.action.type, action.action.doc.path);
  // Make no state changes.
  return {};
}

const printHistory = (action: AnyActionContainer) =>
  action.history.map(h => {
    const { name, delta } = h;
    const sb = [
      `${delta.timestamp.toString()}`,
      `${delta.type} ==> ${name}`,
    ]
    if (delta.meta) sb.push(`meta: ${delta.meta}`);
    if (delta.error) sb.push(`error: ${delta.error}`);
    if (delta.coin) sb.push(`coin: ${delta.coin.toString()}`);
    if (delta.fiat) sb.push(`fiat: ${delta.fiat.toString()}`);
    if (delta.hash) sb.push(`hash: ${delta.hash}`);
    return sb.map(s => `    ${s}`).join('\n');
  }).join('\n');
