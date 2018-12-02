﻿using Nethereum.Web3.Accounts;
using Newtonsoft.Json;
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
		private readonly DB.Records records;
		private readonly TheBankAPI.ITransactionVerifier verifier;

		// TODO: Trivial validation of client nonces
		// Validate known clients, and fetch validation
		// for unknown clients (once we have unknown clients)
		private Dictionary<string, uint> ClientNonces = new Dictionary<string, uint>();

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
		/// <param name="manager"></param>
		/// <param name="account"></param>
		/// <param name="records"></param>
		public HandleTx(ExchangeRateService fxRates, IEmvCard card, ITransactionsApi manager, Account account, DB.Records records, TheBankAPI.ITransactionVerifier verifier)
		{
			FxRates = fxRates;
			Card = card;
			TapCapManager = manager;
			TheAccount = account;
			this.records = records;
			this.verifier = verifier;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="signedRequest"></param>
		/// <returns></returns>
		public SignedMessage RequestTransaction(SignedMessage signedRequest)
		{
			var stopwatch = new System.Diagnostics.Stopwatch();
			stopwatch.Start();

			var clientRequest = JsonConvert.DeserializeObject<TapCapClientRequest>(signedRequest.Message);

			var clientAddressTask = Task.Run(() => Signing.GetSigner(signedRequest.Message, signedRequest.Signature));
			var managerTokenTask = Task.Run(() => Signing.GetSignerAndMessage<TapCapToken>(clientRequest.Token));
			var cryptoCertTask = Task.Run(() => Card.GenerateCrypto(clientRequest));

			var clientAddress = clientAddressTask.GetAwaiter().GetResult();
			var (managerAddress, token) = managerTokenTask.GetAwaiter().GetResult();

			// Verify the token supplied is for the requesting client.
			if (clientAddress != token.ClientAccount)
			{
				var message = string.Format("Invalid input: Token account {0} doesn't match client account {1}", token.ClientAccount, clientAddress);
				logger.Warn(message);

				return new SignedMessage()
				{
					Message = message,
					Signature = ""
				};
			}

			// TODO: Verify manager address is valid.
			// if (managerAdress != ManagerAddress)

			// TODO: Do we want to use my timestamp, or client timestamp?
			var timestamp = TheCoinTime.Now();
			var fxRate = FxRates.GetCurrentFxRate(timestamp);

			// TODO! Reference the Crypto PDOL, so we are not relying
			// on the security in the card to ensure the numbers match.
			// (and we don't generate a cyrpto sig for a different value than here)
			if (!PDOL.ParseIntoCryptoPDOL(clientRequest.CryptoData, CryptoPDOL))
			{
				logger.Warn("Error parsing CPO CDOL: {0}", System.BitConverter.ToString(clientRequest.GpoData));
				return new SignedMessage()
				{
					Message = "Error parsing CPO CDOL:",
					Signature = ""
				};
			}

			var txCents = PDOL.GetAmount(CryptoPDOL);
			if (txCents == 0)
			{
				logger.Warn("Invalid tx cents amount");
				return new SignedMessage()
				{
					Message = "Invalid tx cents amount",
					Signature = ""
				};
			}

			var txCoin = TheContract.ToCoin(txCents / (100 * fxRate.Sell.Value * fxRate._FxRate.Value));

			// TODO: Return "insufficient funds"
			if (txCoin > token.AvailableBalance)
			{
				var message = string.Format("insufficient funds : available {0} < requested {1}", token.AvailableBalance, txCoin);
				logger.Info(message);

				return new SignedMessage()
				{
					Message = message,
					Signature = ""
				};
			}
			// Everything checks out - build the certificate
			var certificate = cryptoCertTask.GetAwaiter().GetResult();

			var tx = new TapCapBrokerPurchase()
			{
				SignedRequest = signedRequest,
				FxRate = PackageInterop.ConvertTo<FXRate>(fxRate),
				CoinCharge = txCoin,
				CryptoCertificate = certificate
			};

			var signedTx = Signing.SignMessage<SignedMessage>(tx, TheAccount);
			Task.Run(async () => await ValidateAndFinalizeTx(tx, txCents, clientAddress));

			logger.Trace(" !-!-!returning tx in: {0}ms !-!-!", stopwatch.ElapsedMilliseconds);

			return signedTx;
		}

		async Task ValidateAndFinalizeTx(TapCapBrokerPurchase purchase, ulong txCents, string clientAddress)
		{
			// First, we have to validate that the Tx went through
			var matchedTx = await verifier.MatchTx(txCents);
			if (matchedTx == null)
			{
				records.AddUnCompleted();
				await SubmitRollbackToManager();
			}
			else
			{
				var cp = PackageInterop.ConvertTo<TapCapManager.Client.Model.TapCapBrokerPurchase>(purchase);
				var validation = new TapCapManager.Client.Model.TapCapBrokerComplete(cp.SignedRequest, cp.FxRate, cp.CoinCharge, "TODO");
				records.AddCompleted(validation, clientAddress, txCents / 100.0);

				await SubmitToManager(validation);
				LogTx(txCents, (ulong)purchase.CoinCharge.Value);
			}
		}

		async Task SubmitRollbackToManager()
		{
			//TapCapManager
		}

		async Task SubmitToManager(TapCapManager.Client.Model.TapCapBrokerComplete purchase)
		{
			// Sign validation and submit to manager.
			var (message, signature) = Signing.GetMessageAndSignature(purchase, TheAccount);
			var signedValidation = new TapCapManager.Client.Model.SignedMessage(message, signature);
			var result = await TapCapManager.TapCapBrokerAsync(signedValidation);
			if (result.Code.Value != 0)
				logger.Error("OnTx: {0}", result.Message);
			// What to do about this?
		}

		void LogTx(ulong txCents, ulong txCoin)
		{
			var fiat = txCents / 100.0;
			var coin = TheContract.ToHuman(txCoin);
			logger.Info("Completed tx: ${0} -> c{1}", fiat, coin);
		}
	}
}
