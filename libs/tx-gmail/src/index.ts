import { log } from "@thecointech/logging";
import { isPresent } from "@thecointech/utilities";
import { fetchEmailIds, fetchEmails, initializeApi, setETransferLabel } from "./fetch";
import { toDepositData } from "./convert";
import { eTransferData } from "./types";
import { authorize, isValid } from "./auth";

export type { Labels } from './fetch';
export * from './types';
export { setETransferLabel };

async function initialize() {
  // First, connect and fetch new deposit emails.
  const auth = await authorize();
  if (!isValid(auth))
    throw new Error("Cannot run service without auth.  Please login from the UI first");

  await initializeApi(auth);
}

export async function fetchETransfers(query?: string): Promise<eTransferData[]> {

  await initialize();

  const result = [] as eTransferData[];
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
    //  deepcode ignore no-any: crazy compiler bug!  Somehow became circular type dep no matter how much explicit typing
    pageToken = nextPageToken as any;

  } while (pageToken !== undefined)

  log.debug(`fetched ${result.length} raw emails`);

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return result.filter(deposit => !!deposit);
}

// fetch new deposits
export async function fetchNewDepositEmails()
{
  log.trace(`fetching from gmail`);
  const emails = await fetchETransfers('redirect interac -remember -expired -label:etransfer-deposited -label:etransfer-rejected');
  log.debug(`fetching emails: got ${emails.length} results`);
  return emails;
}
