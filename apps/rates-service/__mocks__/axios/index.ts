import { jest } from '@jest/globals';
import stock from './fetch.test.stock.json' with { type: "json" }
import fx from './fetch.test.fx.json' with { type: "json" }

export default {
  get: jest.fn((url: String) => {
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
    }
    return undefined;
  })
}
