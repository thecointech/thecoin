import { log } from '@thecointech/logging';
import axios from 'axios';
import { BlockpassData } from '../controllers/types';
import { getSecret } from "@thecointech/secrets";

const getUrl = (address: string) => `https://kyc.blockpass.org/kyc/1.0/connect/${process.env.BLOCKPASS_CLIENT_ID}/refId/${address}`

export async function fetchUser(address: string) {
  log.trace({address}, 'Fetching user data for {address}');
  const r = await axios.get<{ status: string, data: BlockpassData}>(
    getUrl(address),
    {
      headers: {
        'Authorization': await getSecret("BlockpassApiKey")
      }
    }
  );
  if (r.status === 200 && r.data.status == "success") {
    return r.data.data;
  }
  log.error({address}, `Fetch got status ${r.status} - ${r.data.status} for {address}`);
  throw new Error(`Cannot fetch blockpass data for ${address}`);
}
