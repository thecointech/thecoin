﻿using Nethereum.Web3.Accounts;
using NLog;
using System.Collections.Generic;
using System.Linq;
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


		//private List<PDOL.PDOLItem> GpoPDOL;

		private List<PDOL.PDOLItem> _CryptoPDOL;
		private List<PDOL.PDOLItem> CryptoPDOL
		{
			get
			{
				if (_CryptoPDOL == null)
					_CryptoPDOL = PDOL.ParsePDOLItems(Card.CryptoPDOL);
				return _CryptoPDOL;
			}
		}

		private Logger logger = LogManager.GetCurrentClassLogger();

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
			{
				logger.Warn("Invalid input: Token account {0} doesn't match client account {1}", token.ClientAccount, clientAddress);
				return null;
			}

			// TODO: Verify manager address is valid.
			// if (managerAdress != ManagerAddress)

			// TODO: Do we want to use my timestamp, or client timestamp?
			var timestamp = TheCoinTime.Now();
			var fxRate = FxRates.GetCurrentFxRate(timestamp);

			// TODO! Reference the Crypto PDOL, so we are not relying
			// on the security in the card to ensure the numbers match.
			// (and we don't generate a cyrpto sig for a different value than here)
			if (!PDOL.ParseIntoCryptoPDOL(request.CryptoData, CryptoPDOL))
			{
				logger.Warn("Error parsing CPO CDOL: {0}", System.BitConverter.ToString(request.GpoData));
				return null;
			}

			var txCents = PDOL.GetAmount(CryptoPDOL);
			if (txCents == 0)
			{
				logger.Warn("Invalid tx cents amount");
				return null;
			}

			var txCoin = TheContract.ToCoin(txCents / (100 * fxRate.Sell.Value * fxRate._FxRate.Value));

			// TODO: Return "insufficient funds"
			if (txCoin > token.AvailableBalance)
			{
				logger.Warn("insufficient funds : available {0} < requested {1}", token.AvailableBalance, txCoin);
				return null;
			}

			// Everything checks out - build the certificate
			var certificate = Card.GenerateCrypto(request);

			var tx = new TapCapBrokerPurchase()
			{
				SignedRequest = signedRequest,
				FxRate = PackageInterop.ConvertTo<FXRate>(fxRate),
				CoinCharge = txCoin,
				CryptoCertificate = certificate
			};

			logger.Trace("returning tx");
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

				var fxRate = purchase.FxRate;
				var fiat = TheContract.ToHuman((ulong)(purchase.CoinCharge * fxRate.Sell.Value * fxRate._FxRate));
				var coin = TheContract.ToHuman((ulong)purchase.CoinCharge.Value);
				logger.Info("Completed tx: ${0} -> c{1}: {2}", fiat, coin, result.ToString());
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
