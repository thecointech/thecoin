import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DepositData } from './types';
import { Base64 } from 'js-base64';
import { DepositRecord, PurchaseType } from 'containers/TransferList/types';
import { fromMillis } from 'utils/Firebase';
import { addNewEntries } from './utils';

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
}

export async function addFromGmail(): Promise<DepositData[]> {
  let result = [] as DepositData[];
  let nextPageToken = undefined;
  do {
    // Fetch a list of all message id's
    const response = await __gmail.users.messages.list({
      'userId': 'me',
      'q': 'REDIRECT INTERAC -remember'
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

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return addNewEntries([], result.filter(deposit => !!deposit));
}


function toDepositEmail(email: gmail_v1.Schema$Message): DepositData {

  const subject = getSubject(email);
  const body = getBody(email);
  const dateRecieved = getRecievedDate(email);

  if (!subject.endsWith("sent you money.")) {
    console.error(`Unknown deposit type: ${dateRecieved} - ${subject}`);
    return null;
  }

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
      address: getAddressCoin(email),
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
    : "MISSING ACCOUNT INFO";
}

function getUserInfo(email: gmail_v1.Schema$Message) {
  const toField = email.payload.headers.find(h => h.name === "Reply-To").value;
  const match = /<([^<>]+)>$/gi.exec(toField);
  return {
    name: toField.substr(0, match.index).trim(),
    email: match[1]
  }
}

function getAmount(body: string) {
  const culturedAmount = /transfer for the amount of \$([0-9.,]+) \(CAD\)/.exec(body)[1];
  return parseFloat(culturedAmount.replace(',', ''))
}

function getDepositUrl(body: string) {
  return /(https:\/\/etransfer.interac.ca\/[a-z0-9]{8}\/[a-fA-F0-9]{32})\b/i.exec(body)[1];
}

function getRecievedDate(email: gmail_v1.Schema$Message) {
  return new Date(parseInt(email.internalDate));
}

function getSubject(email: gmail_v1.Schema$Message) {
  return email.payload.headers.find(h => h.name === "Subject").value.substr(32);
}

function getBody(email: gmail_v1.Schema$Message): string {
  const textPart = email.payload.parts[0].parts[0].parts[0];
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