using Nethereum.Web3.Accounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Card;
using TapCapSupplier.Server.Models;
using TheUtils;

namespace TapCapSupplier.Server.TapCap
{
	/// <summary>
	/// class for handling transactions
	/// </summary>
	public class HandleTx
	{
		private readonly ExchangeRateService FxRates;
		private readonly IEmvCard Card;
		private readonly TapCapManager.Client.Api.TransactionsApi TapCapManager;
		private readonly Account TheAccount;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="fxRates"></param>
		/// <param name="card"></param>
		/// <param name="account"></param>
		/// <param name="manager"></param>
		HandleTx(ExchangeRateService fxRates, IEmvCard card, Account account, TapCapManager.Client.Api.TransactionsApi manager)
		{
			FxRates = fxRates;
			Card = card;
			TapCapManager = manager;
			TheAccount = account;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="signedRequest"></param>
		/// <returns></returns>
		public SignedMessage RequestTransaction(SignedMessage signedRequest)
		{
			var (clientAddress, request) = Signing.GetSignerAndMessage<TapCapClientRequest>(signedRequest);
			var (managerAddress, token) = Signing.GetSignerAndMessage<TapCapToken>(request.Token);

			// Verify the token supplied is for the requesting client.
			if (clientAddress != token.ClientAccount)
				return null;

			// TODO: Verify manager address is valid.
			// if (managerAdress != ManagerAddress)

			// TODO: Do we want to use my timestamp, or client timestamp?
			var timestamp = TheCoinTime.Now();
			var fxRate = FxRates.GetCurrentFxRate(timestamp);

			var txFiat = request.FiatAmount;
			var txCoin = TheContract.ToCoin(txFiat.Value / (fxRate.Sell.Value * fxRate._FxRate.Value));

			// TODO: Return "insufficient funds"
			if (txCoin > token.AvailableBalance)
				return null;

			// Everything checks out - build the certificate
			var certificate = Card.GenerateCrypto(request);

			var tx = new TapCapBrokerPurchase()
			{
				SignedRequest = signedRequest,
				FxRate = PackageInterop.ConvertTo<FXRate>(fxRate),
				CoinCharge = txCoin,
				CryptoCertificate = certificate
			};

			var signedTx = Signing.MakeSignedMessage<SignedMessage>(tx, TheAccount);

			Task.Run(async () => await ValidateAndFinalizeTx(tx, signedTx));
			return signedTx;
		}

		async Task ValidateAndFinalizeTx(TapCapBrokerPurchase purchase, SignedMessage signedPurchase)
		{
			// First, we have to validate that the Tx went through
			bool purchaseComplete = await ValidateTx(purchase);

			// We assume the purchase completed successfully
			if (purchaseComplete)
			{
				var mgrSignedMessage = PackageInterop.ConvertTo<TapCapManager.Client.Model.SignedMessage>(signedPurchase);
				var result = await TapCapManager.TapCapBrokerAsync(mgrSignedMessage);

			}
		}

		async Task<bool> ValidateTx(TapCapBrokerPurchase purchase)
		{
			// TODO: The last major feature for this system!!!!
			await Task.Delay(1000);
			return true;
		}
	}
}
