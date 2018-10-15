using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.TapCap
{
	public class TapCap
	{
		ExchangeRateService FxRates;

		TapCap(ExchangeRateService fxRates)
		{
			FxRates = fxRates;
		}

		public TapCapTransaction RequestTransaction(SignedMessage signedRequest)
		{
			var (clientAddress, request) = TheUtils.Signing.GetSigned<TapCapRequest>(signedRequest);
			var (managerAddress, token) = TheUtils.Signing.GetSigned<TapCapToken>(request.Token);

			// TODO: Do we want to use my timestamp, or client timestamp?
			var timestamp = TheUtils.TheCoinTime.Now();
			var fxRate = FxRates.GetCurrentFxRate(timestamp);

			var txFiat = request.FiatAmount;
			var txCoin = TheUtils.TheContract.ToCoin(txFiat.Value / (fxRate.Sell.Value * fxRate._FxRate.Value));

			var tx = new TapCapTransaction()
			{

			};
			return tx;
		}
	}
}
