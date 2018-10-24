using Nethereum.Web3.Accounts;
using System.Collections.Generic;
using System.Threading.Tasks;
using TapCapManager.Client.Api;
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
		private readonly ITransactionsApi TapCapManager;
		private readonly Account TheAccount;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="fxRates"></param>
		/// <param name="card"></param>
		/// <param name="account"></param>
		/// <param name="manager"></param>
		public HandleTx(ExchangeRateService fxRates, IEmvCard card, ITransactionsApi manager, Account account)
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

			
			var items = PDOL.ParsePDOLItems(Card.CardStaticResponses().CryptoPdol);
			PDOL.ParseCDOLData(request.CryptoData, items);
			var txCents = PDOL.GetAmount(items);
			var txCoin = TheContract.ToCoin(txCents / (100 * fxRate.Sell.Value * fxRate._FxRate.Value));

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

			var signedTx = Signing.SignMessage<SignedMessage>(tx, TheAccount);
			Task.Run(async () => await ValidateAndFinalizeTx(tx));
			return signedTx;
		}

		async Task ValidateAndFinalizeTx(TapCapBrokerPurchase purchase)
		{
			// First, we have to validate that the Tx went through
			var validation = await ValidateTx(purchase);
			if (validation != null)
			{
				// Sign validation and submit to manager.
				var (message, signature) = Signing.GetMessageAndSignature(validation, TheAccount);
				var signedValidation = new TapCapManager.Client.Model.SignedMessage(message, signature);
				var result = await TapCapManager.TapCapBrokerAsync(signedValidation);
			}
		}

		async Task<TapCapManager.Client.Model.TapCapBrokerComplete> ValidateTx(TapCapBrokerPurchase purchase)
		{
			// TODO: The last major feature for this system!!!!
			await Task.Delay(3000);
			// We assume the purchase completed successfully
			var cp = PackageInterop.ConvertTo<TapCapManager.Client.Model.TapCapBrokerPurchase>(purchase);
			var validation = new TapCapManager.Client.Model.TapCapBrokerComplete(cp.SignedRequest, cp.FxRate, cp.CoinCharge, "TODO");
			return validation;
		}
	}
}
