import stock from './fetch.test.stock.json' assert {type: "json"};
import fx from './fetch.test.fx.json' assert {type: "json"};
import kyc from './fetch.test.kyc.json' assert {type: "json"};

import axios from '../../../node_modules/axios';
const threeHours = 3 * 60 * 60 * 1000;
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
        console.error("WARNING: No mock data for: " + url);
      }
    }
    return undefined;
  },
  request: (request: any) => {
    // dev:live environments run with localhost communications
    if (process.env.CONFIG_NAME === 'devlive' && request.url.startsWith('http://localhost')) {
      return axios.request(request) as any;
    }
    switch(request.url.slice(0, 17)) {
      case '/api/v1/rates/124':
        return {
          status: 200,
          data: {
            124: 1,
            validFrom: Date.now() - threeHours,
            validTill: Date.now() + threeHours,
            sell: 1,
            buy: 1,
            fxRate: 1,
            target: 124
          }
        }
      default: {
        console.error("WARNING: No mock data for: " + request.url);
      }
    }
    return undefined;
  }
}
