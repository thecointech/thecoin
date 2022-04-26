import axios from 'axios';
import { BlockpassData } from './types';
export * from './types'

const getUrl = (address: string) => `'https://kyc.blockpass.org/kyc/1.0/connect/${process.env.BLOCKPASS_CLIENT_ID}/refId/${address}`

export async function fetchUser(address: string) {
  const r = await axios.get<BlockpassData>(
    getUrl(address),
    {
      headers: {
        'Authorization': process.env.BLOCKPASS_API_KEY
      }
    }
  );
  return r.data
}
