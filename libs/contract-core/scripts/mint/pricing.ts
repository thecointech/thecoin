import { CurrencyKey, FXRate } from "@thecointech/fx-rates";
import Decimal from 'decimal.js-light';
import { COIN_EXP } from '@thecointech/contract-core';
import { getProvider } from '@thecointech/ethers-provider';

const thirtyGwei = 30 * Math.pow(10, 9);

export const toCoin = async (rate: FXRate, fiat: Decimal, currency: CurrencyKey) => {
  if (!rate) throw new Error("Missing FXRate");
  let usd = fiat;
  // Convert to USD
  if (currency == "CAD")
    usd = usd.div(rate.fxRate);
  // Convert to Coin
  return usd
    .mul(COIN_EXP)
    .div(fiat.gt(0) ? rate.sell : rate.buy)
    .toint()
}

export async function getGasPrice() {
  const provider = getProvider();
  const fees = await provider.getFeeData();
  const base = Number(fees.maxFeePerGas - fees.maxPriorityFeePerGas);
  const maxPriorityFeePerGas = Math.max(thirtyGwei, Number(fees.maxPriorityFeePerGas));
  return {
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: maxPriorityFeePerGas + base,
  };
}
