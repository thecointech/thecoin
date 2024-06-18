import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { log } from '@thecointech/logging';
import { isPresent } from '@thecointech/utilities';

let __gmail: gmail_v1.Gmail | null = null;
const getGmail = () => {
  if (!__gmail)
    throw new Error("GMail API not initialized, please call initializeApi");
  return __gmail;
}

const __labels = {
  etransfer: null as string | null,
  deposited: null as string | null,
  rejected: null as string | null,
};
export type Labels = keyof typeof __labels;

export async function initializeApi(auth: OAuth2Client) {
  if (__gmail)
    return;

  __gmail = google.gmail({ version: 'v1', auth });

  const profile = await __gmail.users.getProfile({ userId: "me" });
  const expectedAddress = `autodeposit@${process.env.TX_GMAIL_DEPOSIT_DOMAIN}`;
  if (profile.data.emailAddress !== expectedAddress) {
    throw new Error(`Expected ${profile.data.emailAddress} to be ${expectedAddress}`);
  }

  const response = await __gmail.users.labels.list({
    userId: "me"
  })
  const labels = response.data.labels;
  if (labels == null)
    throw new Error("Expected Labels returned from GMail account, check connection");

  const keys = Object.keys(__labels);
  for (const label of labels) {
    const k = keys.find(k => label.name?.endsWith(k));
    if (k) {
      const kf = k as Labels;
      __labels[kf] = label.id ?? null;
    }
  }
  log.trace(`Gmail API initialized for ${profile.data.emailAddress} with ${profile.data.messagesTotal} messages`);
}

// Query gmail for emails matching q query string
export async function fetchEmailIds(options: gmail_v1.Params$Resource$Users$Messages$List) {
  const gmail = getGmail();
  const response = await gmail.users.messages.list({
    userId: 'me',
    ...options,
  });
  return {
    ids: response.data.messages?.map(list => list.id).filter(isPresent) ?? [],
    nextPageToken: response.data.nextPageToken || undefined
  }
}

// Convert the email Ids to emails
export async function fetchEmails(ids: Array<string | undefined | null>) {
  const gmail = getGmail();
  const emailPending = ids
    .filter(isPresent)
    .map(id => gmail.users.messages.get({
      id,
      userId: 'me',
    })
    )
  const emails = await Promise.all(emailPending);
  return emails.map(email => email.data);
}

export async function setETransferLabel(id: string, labelName: Labels) {

  log.debug("Setting transfer label to: " + labelName);
  const labelId = __labels[labelName];
  if (!labelId)
    throw new Error("Labels not initialized, please check init");

  await getGmail().users.messages.modify({
    id: id,
    userId: "me",
    requestBody: {
      addLabelIds: [
        labelId,
      ]
    }
  })
}
