import stock from './fetch.test.stock.json';
import fx from './fetch.test.fx.json';
import kyc from './fetch.test.kyc.json';

import axios from '../../../node_modules/axios';

// NOTE: This axios mock has not been used/tested outside of FinnHub/index.test.ts
export default {
  get: (url: string, ...args: any[]) => {
    // In production environments (which happens in some jest tests)
    // we allow shimming through to the actual library.
    if (process.env.CONFIG_NAME === 'prodtest') {
      return axios.get(url, ...args) as any;
    }
    switch(url.slice(0, 30)) {
      case 'https://finnhub.io/api/v1/stoc':
      return {
        status: 200,
        data: stock
      }
      case 'https://finnhub.io/api/v1/fore':
        return {
          status: 200,
          data: fx
        }
      case 'https://kyc.blockpass.org/kyc/':
        return {
          status: 200,
          data: kyc,  // NOTE: The RefID here should be address (but we don't know it)
        }
      default: {
        console.log("WARNING: No mock data for: " + url);
      }
    }
    return undefined;
  }
}
