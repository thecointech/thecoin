import { createParams } from './simulator/params';
import queryString from 'query-string';
import { log } from '@thecointech/logging';
import { Decimal } from 'decimal.js-light';

const defaultParams = createParams({initialBalance: 1000});

export function getInitParams() {
  const qp = getQueryParams()
  return {
    years: qp?.years ?? 10,
    params: qp?.params ?? defaultParams
  };
}

// Clean the incoming data and convert to appropriate types
function parseDecimals(def: any, src: any): any {
  const dest = {} as any;
  for (const key in def) {
    // If present in query, use that value
    dest[key] = (src[key] !== undefined)
      ? new Decimal(src[key])
      : def[key]
  }
  return dest;
}

function parseData(def: any, src: any) {
  if (!def) return;
  const dest = {} as any;
  for (const key in def) {
    // If present in query, use that value
    if (src[key] !== undefined) {

      switch(key) {
        case 'adjustForInflation':  dest[key] = !!src[key]; break;
        case 'shockAbsorber':  dest[key] = parseDecimals(def[key], src[key]); break;
        case 'income':
        case 'cash':
        case 'credit':
          dest[key] = parseData(def[key], src[key]);
          break;
        default:
          dest[key] = parseFloat(src[key].toString());
          break;
      }
    }
    // else, just use the default
    else {
      dest[key] = def[key];
    }
  }
  return dest;
}

function getQueryParams() {
  try {
    const { sim } = queryString.parse(window.location.href.split('?')[1]);
    if (sim) {
      const { years, ...rest } = JSON.parse(sim?.toString());
      const params = parseData(defaultParams, rest);
      return {
        years: years ? parseInt(years.toString()) : undefined,
        params,
      }
    }
  }
  catch (e) {
    // We don't really care.
    log.info(`Could not parse sim query params: ${(e as Error).message}`);
  }
  return null;
}
