using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using TheBankAPI;

namespace TheBankAPI.Data
{
	/// <summary>
	/// Class provides the interface for storing transactions recorded
	/// </summary>
	public class Records
	{
		private LiteDatabase db;
		private LiteCollection<ClientRequest> requests;
		private LiteCollection<Transaction> transactions;
		private LiteCollection<TransactionFailed> failures;
		private LiteCollection<FXRate> rates;

		/// <summary>
		/// Constructor.  Create DB, initialize mappings
		/// </summary>
		public Records(string rootPath)
		{
			db = new LiteDatabase($@"Filename={rootPath}\transactions.db; Flush=true");
			transactions = db.GetCollection<Transaction>("tx");
			failures = db.GetCollection<TransactionFailed>("fail");
			rates = db.GetCollection<FXRate>("rates");
			requests = db.GetCollection<ClientRequest>("requests");

			// Mapper allows relations between collections
			//var mapper = BsonMapper.Global;
			//mapper.Entity<Transaction>()
			//	.DbRef(x => x.Rate, "rates")
			//	.DbRef(x => x.Request, "requests");

			//mapper.Entity<TransactionFailed>()
			//	.DbRef(x => x.Request, "requests")
			//	.DbRef(x => x.LastTransaction, "tx");
		}

		internal List<Transaction> GetMostRecent(int num)
		{
			return transactions.Include(x => x.Rate)
						.Include(x => x.Request)
						.Find(Query.All(Query.Descending), limit: num)
						.ToList();
		}

		ClientRequest EnsureClientRequest(ClientRequest request)
		{
			// This _should_ be a new request
			var existing = requests.Find(x => x.Signature == request.Signature);
			if (existing != null && existing.Any())
				return existing.First();

			requests.Insert(request);
			return request;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="rate"></param>
		/// <returns></returns>
		FXRate EnsureRate(FXRate rate)
		{
			var existing = rates.Find(x => x.ValidTill == rate.ValidTill);
			if (existing != null && existing.Any())
				return existing.First();

			rates.Insert(rate);
			return rate;
		}

		/// <summary>
		/// Add incomplete (direct from banking site) tx
		/// This may not be necessary, but ensures
		/// we always keep a full record of bank tx in our db
		/// </summary>
		/// <param name="complete"></param>
		public void AddInComplete(Transaction complete)
		{
			// check for already existing FxRate
			transactions.Insert(complete);
		}

		/// <summary>
		/// Add a record for a completed and validated transaction
		/// </summary>
		/// <param name="complete"></param>
		/// <param name="clientAddress"></param>
		/// <param name="fiatRequested"></param>
		public void AddCompleted(Transaction complete)
		{
			// check for already existing FxRate
			complete.Rate = EnsureRate(complete.Rate);
			complete.Request = EnsureClientRequest(complete.Request);

			transactions.Upsert(complete);
		}

		/// <summary>
		/// Remember a tx that did not complete
		/// </summary>
		/// <param name="request"></param>
		/// <param name="clientAddress"></param>
		/// <param name="fiatRequested"></param>
		internal void AddFailed(ClientRequest request, Transaction mostRecent, int fiatRequested, byte[] response)
		{
			var failure = new TransactionFailed()
			{
				Request = EnsureClientRequest(request),
				LastTransaction = mostRecent,
				FiatRequested = fiatRequested,
				Response = response
			};
			failures.Insert(failure);
		}
	}
}
