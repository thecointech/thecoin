import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DepositData } from './types';
import { Base64 } from 'js-base64';
import { DepositRecord, PurchaseType } from '../base/types';
import { addNewEntries } from './process';
import { log } from '@the-coin/logging';
import { Timestamp } from '@the-coin/utilities/firestore';

export const trimQuotes = (s?: string) => s?.replace (/(^")|("$)/g, '');

let __gmail: gmail_v1.Gmail | null = null;
const getGmail = () => {
  if (!__gmail)
    throw new Error("GMail API not initialized, please call initialiseApi");
  return __gmail;
}

const __labels = {
  etransfer: null as string | null,
  deposited: null as string | null,
  rejected: null as string | null,
};
type Labels = typeof __labels;

export async function initializeApi(auth: OAuth2Client) {
  if (__gmail)
    return;

  __gmail = google.gmail({ version: 'v1', auth });

  let response = await __gmail.users.labels.list({
    userId: "me"
  })
  const labels = response.data.labels;
  if (labels == null)
    throw new Error("Expected Labels returned from GMail account, check connection");

  const keys = Object.keys(__labels);
  for (const label of labels) {
    const k = keys.find(k => label.name?.endsWith(k));
    if (k) {
      const kf: keyof Labels = k as any;
      __labels[kf] = label.id ?? null;
    }
  }
  log.trace(`Gmail API initialized`);
}

export async function addFromGmail(query?: string): Promise<DepositData[]> {

  const gmail = getGmail();
  let result = [] as DepositData[];
  let nextPageToken = undefined;

  const q = query ?? 'REDIRECT INTERAC -remember';
  do {
    // Fetch a list of all message id's
    const response = await gmail.users.messages.list({
      userId: 'me',
      q
    });

    // Fetch the actual email
    const emailPending = response.data.messages?.map(m =>
      gmail.users.messages.get({
        id: m.id ?? undefined,
        userId: 'me'
      })
    )
    if (emailPending)
    {
      let emails = await Promise.all(emailPending);
      let deposits = emails
        .map(r => toDepositEmail(r.data))
        .filter(r => !!r);
      result = result.concat(deposits as DepositData[])
    }

    // TODO: untested, but we could have more than 50 emails in a day
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken !== undefined)

  log.debug(`fetched ${result.length} raw emails`);

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return addNewEntries([], result.filter(deposit => !!deposit));
}


function toDepositEmail(email: gmail_v1.Schema$Message): DepositData|null {

  const subject = getSubject(email);
  if (!subject)
    return null;
  const dateRecieved = getRecievedDate(email);
  if (!dateRecieved)
    return null;
  const body = getBody(email);
  if (!body)
    return null;
  const address = getAddressCoin(email);
  if (!address)
    return null;

  var url = getDepositUrl(body);
  if (!url)
  {
    log.error({url, subject}, "No url or invalid url found: {url} for email: {subject}");
    return null;
  }

  const record: DepositRecord = {
    transfer: {
      value: -1
    },
    recievedTimestamp: Timestamp.fromMillis(dateRecieved.getTime()),
    hash: "",
    confirmed: false,
    fiatDisbursed: getAmount(body),
    type: PurchaseType.etransfer,
    sourceId: getSourceId(url),
  }

  return {
    record,

    instruction: {
      depositUrl: url.toString(),
      address: address,
      recieved: dateRecieved,
      ...getUserInfo(email),
      subject,
      body,
      raw: email
    },
    db: null,
    bank: null,
    tx: null,
  }
}

const findHeader = (email: gmail_v1.Schema$Message, header: string) =>
  email.payload?.headers?.find(h => h.name === header)?.value;

function getAddressCoin(email: gmail_v1.Schema$Message) {
  const toField = findHeader(email, "To");
  if (toField) {
    const match = /<([A-Fx0-9]+)@thecoin.io>\s*$/gi.exec(toField);
    if (match)
      return match[1]
  }
  return null;
}

function getUserInfo(email: gmail_v1.Schema$Message) {
  // We use the "Reply-To" header here because some banks (ex-RBC)
  // put their clients email address in this field.
  const toField = findHeader(email, "Reply-To");
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

const getAmount = (body: string) => getAmountAnglais(body) ?? getAmountFrancais(body) ?? -1;

function getAmountAnglais(body: string) {
  const amountRes = /transfer for the amount of \$([0-9.,]+) \(CAD\)/.exec(body);
  return (amountRes)
    // deepcode ignore GlobalReplacementRegex: Is mistakenly detecting replace has containing a regex
    ? parseFloat(amountRes[1].replace(',', ''))
    : undefined;
}
function getAmountFrancais(body: string) {
  const amountRes = /vous a envoyé un virement de ([0-9,]+) \$ \(CAD\)/.exec(body)
  return (amountRes)
    ? parseFloat(amountRes[1])
    : undefined;
}

function getDepositUrl(body: string) {
  const r = /(https:\/\/etransfer.interac.ca\/[a-z0-9]{8}\/[a-fA-F0-9]{32})\b/i.exec(body);
  return r
    ? new URL(r[1])
    : undefined;
}

function getRecievedDate(email: gmail_v1.Schema$Message) {
  return email.internalDate
    ? new Date(parseInt(email.internalDate))
    : new Date();
}

function getSubject(email: gmail_v1.Schema$Message) {
  const subject = findHeader(email, "Subject");
  // First, ignore any emails with no subject
  if (!subject)
    return null;
  // filter an RE emails
  if (subject.startsWith("Re: [REDIRECT:]"))
    return null;

  const parsed = getSubjectAnglais(subject) ?? getSubjectFrancais(subject);
  if (!parsed)
    log.error(`Unknown deposit type: ${subject}`);

  return parsed;
}

function getSubjectAnglais(subject: string) {
  const redirectHeader = "[REDIRECT:] INTERAC e-Transfer: "
  if (!subject.endsWith("sent you money.") || !subject.startsWith(redirectHeader)) {
    return null;
  }
  return subject.substr(redirectHeader.length);
}

function getSubjectFrancais(subject: string) {
  const redirectHeader = "[REDIRECT:] Virement INTERAC"
  if (!subject.endsWith("vous a envoyé des fonds.") || !subject.startsWith(redirectHeader)) {
    return null;
  }
  return subject.substr(redirectHeader.length);
}

function getBody(email: gmail_v1.Schema$Message): string {
  let mp = email.payload;
  for (let i = 0; i < 3; i++)
  {
    if (!mp || !mp.parts)
      return "";
    mp = mp.parts[0]
  }
  const tp = mp?.body?.data;
  if (!tp)
    return "";
  //const textPart = email.payload.parts[0].parts[0].parts[0];
  const decoded = Base64.decode(tp);
  return decoded;
}

// Get a unique identifier for this deposit
function getSourceId(url: URL) {
  return url.searchParams.get("pID") ?? url.pathname.split("/").slice(-2)[0];
}
///////////////////////////////////////////////////////////

export async function setETransferLabel(email: gmail_v1.Schema$Message, labelName: keyof Labels) {

  log.debug("Setting transfer label to: " + labelName);
  const labelId = __labels[labelName];
  if (!labelId)
    throw new Error("Labels not initialized, please check init");

  await getGmail().users.messages.modify({
    id: email.id!,
    userId: "me",
    requestBody: {
      addLabelIds: [
        labelId,
      ]
    }
  })
}
