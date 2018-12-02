using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TheBankAPI;
using TheUtils;

namespace TapCapSupplier.Server.DB
{
	/// <summary>
	/// Class provides the interface for storing transactions recorded
	/// </summary>
	public class Records
	{
		private LiteDatabase db;
		private LiteCollection<ClientRequest> requests;
		private LiteCollection<TransactionComplete> transactions;
		private LiteCollection<TransactionFailed> failures;
		private LiteCollection<FXRate> rates;

		private ITransactionVerifier verifier;

		/// <summary>
		/// Constructor.  Create DB, innitialize mappings
		/// </summary>
		public Records(ITransactionVerifier verifier)
		{
			db = new LiteDatabase(@"Filename=transactions.db; Flush=true");
			transactions = db.GetCollection<TransactionComplete>("tx");
			failures = db.GetCollection<TransactionFailed>("fail");
			rates = db.GetCollection<FXRate>("rates");
			requests = db.GetCollection<ClientRequest>("requests");
			this.verifier = verifier;

			// Mapper allows relations between collections
			var mapper = BsonMapper.Global;
			mapper.Entity<TransactionComplete>()
				.DbRef(x => x.Rate, "rates")
				.DbRef(x => x.Request, "requests");
		}

		ClientRequest EnsureClientRequest(TapCapManager.Client.Model.SignedMessage request, string clientAddress, double fiatRequested)
		{
			// This _should_ be a new request
			var clientRequest = new ClientRequest()
			{
				Message = request.Message,
				Signature = request.Signature,
				ClientAddress = clientAddress,
				FiatRequested = fiatRequested
			};
			requests.Insert(clientRequest);
			return clientRequest;
		}

		FXRate EnsureRate(TapCapManager.Client.Model.FXRate rate)
		{
			var existing = rates.Find(x => x.ValidTill == rate.ValidTill);
			if (existing != null && existing.Any())
				return existing.First();

			var newRate = new FXRate()
			{
				Buy = rate.Buy,
				Sell = rate.Sell,
				Target = rate.Target,
				ValidFrom = rate.ValidFrom,
				ValidTill = rate.ValidTill
			};
			rates.Insert(newRate);
			return newRate;
		}

		/// <summary>
		/// Add a record for a completed and validated transaction
		/// </summary>
		/// <param name="complete"></param>
		/// <param name="clientAddress"></param>
		/// <param name="fiatRequested"></param>
		public void AddCompleted(TapCapManager.Client.Model.TapCapBrokerComplete complete, string clientAddress, double fiatRequested)
		{
			// check for already existing FxRate
			var rate = EnsureRate(complete.FxRate);
			var request = EnsureClientRequest(complete.SignedRequest, clientAddress, fiatRequested);
			var dbRecord = new TransactionComplete()
			{
				Request = request,
				CoinCharged = complete.CoinCharge.Value,
				Rate = rate,
				MerchantId = complete.MerchantId,
			};

			transactions.Insert(dbRecord);
		}

		internal void AddUnCompleted(ClientRequest request)
		{
			var latestTx = verifier.GetLatestTx();
			var failure = new TransactionFailed()
			{
				Request = request,
				CurrentBalance = latestTx.Balance,
				LastTxAmount = (int)latestTx.Deposit - (int)latestTx.Withdrawal
			};
			failures.Insert(failure);
		}
	}
}
