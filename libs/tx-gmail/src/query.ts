import { log } from "@thecointech/logging";
import { isPresent } from "@thecointech/utilities";
import { fetchEmailIds, fetchEmails } from "./fetch";
import { toDepositData } from "./convert";
import { eTransferData } from "./types";

export async function queryETransfers(query?: string): Promise<eTransferData[]> {

  const result = [] as eTransferData[];
  let pageToken: string | undefined = undefined;

  const q = query ?? 'INTERAC -remember';

  do {
    // Fetch a list of all message id's
    const { ids, nextPageToken } = await fetchEmailIds({ q, pageToken });

    // Convert to emails
    const emails = await fetchEmails(ids);

    // find deposit emails from the list
    const deposits = emails.map(toDepositData)
      .filter(isPresent);

    result.push(...deposits)
    pageToken = nextPageToken;

  } while (pageToken !== undefined)

  log.debug(`fetched ${result.length} raw emails`);

  // Filter out any null entries (could come from invalid emails being picked up by the filter)
  return result.filter(deposit => !!deposit);
}

// fetch new deposits
export async function queryNewDepositEmails()
{
  log.trace(`fetching from gmail`);
  const emails = await queryETransfers('interac -remember -expired -label:etransfer-deposited -label:etransfer-rejected');
  log.debug(`fetching emails: got ${emails.length} results`);
  return emails;
}
