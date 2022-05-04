import stock from './fetch.test.stock.json';
import fx from './fetch.test.fx.json';
import kyc from './fetch.test.kyc.json';

// NOTE: This axios mock has not been used/tested outside of FinnHub/index.test.ts
export default {
  get: (url: string) => {
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
    }
    return undefined;
  }
}
