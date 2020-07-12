import coindata from './fetch.test.coindata.json';
import fxdata from './fetch.test.fxdata.json';

const FinnHub = jest.genMockFromModule('../index') as any;

export async function fetchNewCoinRates(_resolution: string, _from: number, _to: number)
{
  return coindata;
}

export async function fetchNewFxRates(_resolution: string, _from: number, _to: number)
{
  return fxdata;
}

FinnHub.fetchNewCoinRates = fetchNewCoinRates;
FinnHub.fetchNewFxRates = fetchNewFxRates;
