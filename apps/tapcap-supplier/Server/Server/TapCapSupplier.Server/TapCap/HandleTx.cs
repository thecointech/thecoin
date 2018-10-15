using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.TapCap
{
	public class TapCap
	{
		private readonly ExchangeRateService FxRates;
		private readonly EmvCard Card;

		TapCap(ExchangeRateService fxRates, Card card)
		{
			FxRates = fxRates;
		}

		public TapCapBrokerPurchase RequestTransaction(SignedMessage signedRequest)
		{
			var (clientAddress, request) = TheUtils.Signing.GetSigned<TapCapRequest>(signedRequest);
			var (managerAddress, token) = TheUtils.Signing.GetSigned<TapCapToken>(request.Token);

			// Verify the token supplied is for the requesting client.
			if (clientAddress != token.clientAccount)
				return null;

			// TODO: Verify manager address is valid.
			// if (managerAdress != ManagerAddress)

			// TODO: Do we want to use my timestamp, or client timestamp?
			var timestamp = TheUtils.TheCoinTime.Now();
			var fxRate = FxRates.GetCurrentFxRate(timestamp);

			var txFiat = request.FiatAmount;
			var txCoin = TheUtils.TheContract.ToCoin(txFiat.Value / (fxRate.Sell.Value * fxRate._FxRate.Value));

			// TODO: Return "insufficient funds"
			if (txCoin > token.availableBalance)
				return null;

			// Everything checks out - build the certificate
			var certificate = Card.GenerateCrypto(request);

			var tx = new TapCapBrokerPurchase()
			{
      			SignedRequest = signedRequest,
      			FxRate = fxRate,
      			CoinCharge = txCoin,
      			CryptoCertificate = certificate
			};
			return tx;
		}
	}
}
