import { getSecret } from "@thecointech/secrets";

export async function getAuthConfig(): Promise<TxGmailClient> {
  const secret = await getSecret('TxGmailClient');
  const parsed = JSON.parse(secret);
  if (!parsed.Id || !parsed.Secret || !parsed.Uri || !parsed.ListenerPort) {
    throw new Error("Invalid secret client data");
  }
  return {
    Id: parsed.Id,
    Secret: parsed.Secret,
    Uri: parsed.Uri,
    ListenerPort: Number(parsed.ListenerPort)
  }
}

type TxGmailClient = {
  Id: string;
  Secret: string;
  Uri: string;
  ListenerPort: number;
}