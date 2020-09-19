import { NextOpenTimestamp} from '@the-coin/utilities/MarketStatus';

const fn : typeof NextOpenTimestamp = async (date: Date, _offset: number=120 * 1000) => {
  return date.getTime();
}

export {fn as NextOpenTimestamp};
