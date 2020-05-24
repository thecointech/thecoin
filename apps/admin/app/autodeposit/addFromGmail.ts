import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DepositData } from './types';
import { Base64 } from 'js-base64';
import { DepositRecord, PurchaseType } from '../autoaction/types';
import { fromMillis } from 'utils/Firebase';
import { addNewEntries } from './process';
import { trimQuotes } from '../utils';
import { log } from 'logging';

let __gmail: gmail_v1.Gmail | null = null;

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

  var response = await __gmail.users.labels.list({
    userId: "me"
  })
  const labels = response.data.labels;
  const keys = Object.keys(__labels);
  for (const label of labels) {
    const k = keys.find(k => label.name.endsWith(k));
    if (k) {
      __labels[k] = label.id;
    }
  }
  log.trace(`Gmail API initialized`);
}

export async function addFromGmail(query?: string): Promise<DepositData[]> {
  let result = [] as DepositData[];
  let nextPageToken = undefined;

  const q = query ?? 'REDIRECT INTERAC -remember';
  do {
    // Fetch a list of all message id's
    const response = await __gmail.users.messages.list({
      userId: 'me',
      q
    });

    // Fetch the actual email
    const emailPending = response.data.messages.map(m =>
      __gmail.users.messages.get({
        id: m.id,
        userId: 'me'
      })
    )
    var emails = await Promise.all(emailPending);
    result = result.concat(
      emails.map(r => toDepositEmail(r.data))
    );

    // TODO: untested, but we could have more than 50 emails in a day
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken !== undefined)

  log.debug(`fetched ${result.length} raw emails`);

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return addNewEntries([], result.filter(deposit => !!deposit));
}


function toDepositEmail(email: gmail_v1.Schema$Message): DepositData {

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

  const record: DepositRecord = {
    transfer: {
      value: -1
    },
    recievedTimestamp: fromMillis(dateRecieved.getTime()),
    hash: "",
    confirmed: false,
    fiatDisbursed: getAmount(body),
    type: PurchaseType.etransfer,
  }

  return {
    record,

    instruction: {
      depositUrl: getDepositUrl(body),
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

function getAddressCoin(email: gmail_v1.Schema$Message) {
  const toField = email.payload.headers.find(h => h.name === "To").value;
  const match = /<([A-Fx0-9]+)@thecoin.io>\s*$/gi.exec(toField);
  return (match)
    ? match[1]
    : null;
}

function getUserInfo(email: gmail_v1.Schema$Message) {
  // We use the "Reply-To" header here because some banks (ex-RBC)
  // put their clients email address in this field.
  const toField = email.payload.headers.find(h => h.name === "Reply-To").value;
  const match = /<([^<>]+)>$/gi.exec(toField);
  return {
    name: trimQuotes(toField.substr(0, match.index).trim()),
    email: match[1]
  }
}

const getAmount = (body: string) => getAmountAnglais(body) ?? getAmountFrancais(body);
function getAmountAnglais(body: string) {
  const amountRes = /transfer for the amount of \$([0-9.,]+) \(CAD\)/.exec(body);
  if (amountRes)
    return parseFloat(amountRes[1].replace(',', ''))
}
function getAmountFrancais(body: string) {
  const amountRes = /vous a envoyé un virement de ([0-9,]+) \$ \(CAD\)/.exec(body)
  if (amountRes)
    return parseFloat(amountRes[1])
}

function getDepositUrl(body: string) {
  return /(https:\/\/etransfer.interac.ca\/[a-z0-9]{8}\/[a-fA-F0-9]{32})\b/i.exec(body)[1];
}

function getRecievedDate(email: gmail_v1.Schema$Message) {
  return new Date(parseInt(email.internalDate));
}

function getSubject(email: gmail_v1.Schema$Message) {
  const subject = email.payload.headers.find(h => h.name === "Subject").value;
  // First, filter an RE emails
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
  const textPart = email.payload.parts[0]?.parts[0]?.parts[0];
  const decoded = Base64.decode(textPart.body.data);
  return decoded;
}

///////////////////////////////////////////////////////////

export async function setETransferLabel(email: gmail_v1.Schema$Message, labelName: keyof Labels) {
  const labelId = __labels[labelName]
  await __gmail.users.messages.modify({
    id: email.id,
    userId: "me",
    requestBody: {
      addLabelIds: [
        labelId,
      ]
    }
  })
}
