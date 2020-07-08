import data from './fetch.test.data.json';

const FinnHub = jest.genMockFromModule('../index') as any;

export async function fetchNewCoinRates(_resolution: string, _from: number, _to: number)
{
  return data;
}

FinnHub.fetchNewCoinRates = fetchNewCoinRates;
