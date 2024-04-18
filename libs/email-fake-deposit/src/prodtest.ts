import { SendMail } from '@thecointech/email';
import { getEmailTitle, getEmailBody, getEmailAddress } from './details';
import { DateTime } from 'luxon';

export * from './details';
export const emailCacheFile = "NOT APPLICABLE TO PRODTEST";

export function SendFakeDeposit(address: string, amount: number, date: DateTime) {
  return SendMail(
    getEmailTitle(),
    getEmailBody(amount, date),
    getEmailAddress(address),
    false
  )
}
