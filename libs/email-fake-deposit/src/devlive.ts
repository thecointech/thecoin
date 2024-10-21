import { getEmailTitle, getEmailBody, getEmailAddress } from "./details";
import { DateTime } from "luxon";
import { Base64 } from 'js-base64';
import fs from 'node:fs';
import os from 'node:os';
import { v4 as uuidv4 } from 'uuid';

export * from './details';

// duplicated to GmailMocked
export const emailCacheFile = os.tmpdir() + "/devlive-email.json";

export async function SendFakeDeposit(address: string, amount: number, date: DateTime) {

  const title = getEmailTitle();
  const body = getEmailBody(amount, date);
  const toAddress = getEmailAddress(address);

  const existing = getExistingEmails();
  // Append new deposit data
  existing.push({
    id: uuidv4(),
    internalDate: date.toMillis(),
    payload: {
      headers: [
        {
          name: "To",
          value: toAddress
        },
        {
          name: "Subject",
          value: title
        },
        {
          name: "Reply-To",
          value: "FakeDeposit@devlive.com"
        }
      ],
      mimeType: "text/plain",
      body: {
        data: Base64.encode(body)
      }
    }
  })
  // write the file
  fs.writeFileSync(emailCacheFile, JSON.stringify(existing), "utf8");
  return true;
}

function getExistingEmails() {
  if (!fs.existsSync(emailCacheFile)) {
    return [];
  }
  // read the file
  const raw = fs.readFileSync(emailCacheFile, "utf8");
  // as JSON
  const json = JSON.parse(raw);
  return json as any[];
}
