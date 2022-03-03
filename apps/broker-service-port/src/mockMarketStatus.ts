import * as fns from '@thecointech/market-status';

const oldOpenTimestamp = fns.nextOpenTimestamp;
export const mockMarketStatus = (millis: number) => {
  (fns as any).nextOpenTimestamp = () => {
    return  Promise.resolve(millis);
  }
}
export const unmockMarketStatus = () =>{
  (fns as any).nextOpenTimestamp = oldOpenTimestamp;
}
