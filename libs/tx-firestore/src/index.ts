import { log } from "@the-coin/logging";
import { isPresent } from "@the-coin/utilities";
import { fetchEmailIds, fetchEmails, initializeApi } from "./fetch";
import { toDepositData } from "./convert";
import { eTransferData } from "./types";
import { authorize, isValid } from "auth";

export async function fetchETransfers(query?: string): Promise<eTransferData[]> {

  let result = [] as eTransferData[];
  let pageToken: string | undefined = undefined;

  const q = query ?? 'REDIRECT INTERAC -remember';

  do {
    // Fetch a list of all message id's
    const { ids, nextPageToken } = await fetchEmailIds({ q, pageToken });

    // Convert to emails
    const emails = await fetchEmails(ids);

    // find deposit emails from the list
    const deposits = emails.map(toDepositData)
      .filter(isPresent);

    result.push(...deposits)
    pageToken = nextPageToken as any; // crazy compiler bug!  Somehow became circular type dep no matter how much explicit typing

  } while (pageToken !== undefined)

  log.debug(`fetched ${result.length} raw emails`);

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return result.filter(deposit => !!deposit);
}

export async function FetchNewDepositEmails()
{
  log.trace(`fetching from gmail`);
  // First, connect and fetch new deposit emails.
  const auth = await authorize();
  if (!isValid(auth))
    throw new Error("Cannot run service without auth.  Please login from the UI first");

  await initializeApi(auth);

  // fetch new deposits
  const emails = await fetchETransfers('redirect interac -remember -expired -label:etransfer-deposited -label:etransfer-rejected');
  log.debug(`fetching emails: got ${emails.length} results`);
  return emails;
}
