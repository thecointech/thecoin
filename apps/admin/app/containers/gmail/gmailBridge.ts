import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DepositData } from './types';
import { Base64 } from 'js-base64';
import { TransferRecord } from 'containers/TransferList/types';
import { fromMillis } from 'utils/Firebase';


export async function fetchDepositEmails(auth: OAuth2Client) : Promise<DepositData[]> {
  const gmail = google.gmail({ version: 'v1', auth });
  let result = [] as DepositData[];
  let nextPageToken = undefined;
  do {
    // Fetch a list of all message id's
    const response = await gmail.users.messages.list({
      'userId': 'me',
      'q': 'REDIRECT INTERAC -remember'
    });

    // Fetch the actual email
    const emailPending = response.data.messages.map(m =>
      gmail.users.messages.get({
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
  return result.filter(deposit => !!deposit);
}


function toDepositEmail(email: gmail_v1.Schema$Message) : DepositData {

  const subject = getSubject(email);
  const body = getBody(email);
  const dateRecieved = getRecievedDate(email);

  if (!subject.endsWith("sent you money."))
  {
    console.error(`Unknown deposit type: ${dateRecieved} - ${subject}`);
    return null;
  }
  console.log(`Translating: ${dateRecieved.toDateString()} - ${subject}`);

  const record: TransferRecord =  { 
      transfer: {
        value: -1
      },
      recievedTimestamp: fromMillis(dateRecieved.getTime()),
      hash: "",
      confirmed: false,
      fiatDisbursed: getAmount(body)
  }

  return {
    record,

    instruction: {
      depositUrl: getDepositUrl(body),
      address: getAddressCoin(email),
      ...getUserInfo(email),
      subject,
      body,
      raw: email
    }
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
    name: toField.substr(0, match.index),
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

// function wasProcessed(email: gmail_v1.Schema$Message) {
//   return false;
// }

function getSubject(email: gmail_v1.Schema$Message) {
  return email.payload.headers.find(h => h.name === "Subject").value.substr(32);
}

function getBody(email: gmail_v1.Schema$Message) : string {
  const textPart = email.payload.parts[0].parts[0].parts[0];
  const decoded = Base64.decode(textPart.body.data);
  return decoded;
}



