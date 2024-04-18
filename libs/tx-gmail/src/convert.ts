import { gmail_v1 } from 'googleapis';
import { eTransferData } from './types';
import { Base64 } from 'js-base64';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import currency from 'currency.js';

const DEPOSIT_DOMAIN = process.env.TX_GMAIL_DEPOSIT_DOMAIN
if (!DEPOSIT_DOMAIN) throw new Error("Missing processing domain");

export const trimQuotes = (s?: string) => s?.replace(/(^")|("$)/g, '');

export function toDepositData(email: gmail_v1.Schema$Message): eTransferData | null {

  const subject = getSubject(email);
  if (!subject)
    return null;
  const dateRecieved = getRecievedDate(email);
  if (!dateRecieved)
    return null;
  const address = getAddressCoin(email);
  if (!address)
    return null;
  const userInfo = getUserInfo(email);

  const body = getBody(email);
  if (!body)
    return null;
  const amount = getAmount(body);
  if (!amount)
    return null;
  const url = getDepositUrl(body);
  if (!url) {
    log.error({ url, subject }, "No url or invalid url found: {url} for email: {subject}");
    return null;
  }

  // PRODTEST-ONLY-CODE
  // In prodtest we allow overriding the recieved date
  if (process.env.CONFIG_NAME === "prodtest") {
    const overrideDate = body.match(/{ dateOverride: "([^}]+)" }/)
    if (overrideDate) {
      const d = DateTime.fromISO(overrideDate[1]);
      if (d.isValid)
        return {
          raw: email,
          recieved: d,
          id: getSourceId(url),
          depositUrl: url.toString(),
          address,
          cad: new Decimal(amount),
          ...userInfo
        }
    }
  }
  // END PRODTEST-ONLY-CODE

  return {
    raw: email,
    recieved: dateRecieved,
    id: getSourceId(url),
    depositUrl: url.toString(),
    address,
    cad: new Decimal(amount),
    ...userInfo
  }
}

const findHeader = (email: gmail_v1.Schema$Message, header: string) =>
  email.payload?.headers?.find(h => h.name === header)?.value;

function getAddressCoin(email: gmail_v1.Schema$Message) {
  const toField = findHeader(email, "To");
  if (toField) {
    const re = new RegExp(`([A-Fx0-9]+)@${DEPOSIT_DOMAIN}`, "gi")
    const match = re.exec(toField);
    if (match && IsValidAddress(match[1]))
      return NormalizeAddress(match[1])
  }
  return null;
}

function getUserInfo(email: gmail_v1.Schema$Message) {
  // We use the "Reply-To" header here because some banks (ex-RBC)
  // put their clients email address in this field.
  // This is debugging info and will not be used for processing
  let toField = findHeader(email, "Reply-To");
  if (!toField && process.env.CONFIG_NAME === "prodtest") {
    // In prodtest the emails are sent from personal email accounts
    toField = toField ?? findHeader(email, "From");
  }
  if (toField) {
    const match = /<([^<>]+)>$/gi.exec(toField);
    if (match) {
      return {
        name: trimQuotes(toField.substr(0, match.index).trim()) ?? "Error when parsed",
        email: match[1]
      }
    }
  }
  return {
    name: "Not found",
    email: "Not found"
  };
}

const getAmount = (body: string) => getAmountAnglais(body) ?? getAmountFrancais(body);

function getAmountAnglais(body: string) {
  const amountRes = /transfer for the amount of \$([0-9.,]+) \(CAD\)/.exec(body);
  return (amountRes)
    ? currency(amountRes[1]).value
    : undefined;
}
function getAmountFrancais(body: string) {
  const amountRes = /vous a envoyé un virement de ([ 0-9,]+) \$ \(CAD\)/.exec(body)
  return (amountRes)
    ? currency(amountRes[1], {decimal: ','}).value
    : undefined;
}

function getDepositUrl(body: string) {
  const r = /(https:\/\/etransfer.interac.ca\/[a-z0-9]{8}\/[a-f0-9]+)\b/i.exec(body);
  return r
    ? new URL(r[1])
    : undefined;
}

function getRecievedDate(email: gmail_v1.Schema$Message) {
  return email.internalDate
    ? DateTime.fromMillis(Number(email.internalDate))
    : null;
}

function getSubject(email: gmail_v1.Schema$Message) {
  const subject = findHeader(email, "Subject");
  // First, ignore any emails with no subject
  if (!subject)
    return null;
  // Filter expired notifications
  if (subject.endsWith("expired."))
    return null;

  const parsed = getSubjectAnglais(subject) ?? getSubjectFrancais(subject);
  if (!parsed)
    log.error(`Unknown deposit type: ${subject}`);

  return parsed;
}

function getSubjectAnglais(subject: string) {
  const redirectHeader = "INTERAC e-Transfer: "
  if (!subject.endsWith("sent you money.") || !subject.startsWith(redirectHeader)) {
    return null;
  }
  return subject.substring(redirectHeader.length);
}

function getSubjectFrancais(subject: string) {
  const redirectHeader = "Virement INTERAC"
  if (!subject.endsWith("vous a envoyé des fonds.") || !subject.startsWith(redirectHeader)) {
    return null;
  }
  return subject.substring(redirectHeader.length);
}

function getBody(email: gmail_v1.Schema$Message) {
  let mp = email.payload;
  // Find raw text version of the email
  for (let i = 0; i < 3; i++) {
    if (mp?.mimeType === 'text/plain')
      break;
    mp = mp?.parts?.[0]
  }
  const tp = mp?.body?.data;
  return (tp)
    ? Base64.decode(tp)
    : null;
}

// Get a unique identifier for this deposit
function getSourceId(url: URL) {
  return url.searchParams.get("pID") ?? url.pathname.split("/").slice(-2)[0];
}
///////////////////////////////////////////////////////////
