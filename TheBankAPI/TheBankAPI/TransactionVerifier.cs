using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapManager.Client.Model;
using TheBankAPI.Data;
using TheUtils;

namespace TheBankAPI
{
	public class TransactionVerifier : ITransactionVerifier
	{
		private List<Data.Transaction> recentTransactions = new List<Data.Transaction>();
		private BalanceAPI balanceAPI;
		private Records records;
		private ILogger<ITransactionVerifier> logger;

		/// <summary>
		/// Only hold 100 recent transactions
		/// </sumary>
		const int MaxHistoryLength = 100;

		public TransactionVerifier(ILogger<ITransactionVerifier> logger, string basePath)
		{
			records = new Records(basePath);
			balanceAPI = new BalanceAPI(logger, basePath);
			this.logger = logger;

			recentTransactions = records.GetMostRecent(10);
		}

		public async Task<Transaction> MatchTx(TapCapBrokerPurchase brokerResponse, int fiatRequested)
		{
			var newTx = BuildTx(brokerResponse, fiatRequested);
			await Task.Delay(2000);

			// We make 10 attempts to fetch the latest tx
			for (int i = 0; i < 3; await Task.Delay(3000), i++)
			{
				var recentTx = await UpdateMostRecentTx();
				foreach (var tx in recentTx)
				{
					if (tx.Request != null)
					{
						// If this was a very recent transaction, allow
						// to continue checking.  This is not the
						// tx we are looking for, but it's possible
						// it was logged just after our tx
						if ((tx.Date.Date - newTx.Date).TotalSeconds < 30)
							continue;
						// This tx was matched some time ago, consider this a bust
						break;
					}

					if (tx.Equals(newTx))
					{
						// This is our best guess.  Numbers match, so set 'er in
						tx.CoinChange = newTx.CoinChange;
						tx.Date = newTx.Date;
						tx.Rate = newTx.Rate;
						tx.Request = newTx.Request;
						records.AddCompleted(tx);
						return tx;
					}
				}
				logger.LogInformation("Did not match tx {0}", fiatRequested);
			}

			var mostRecent = recentTransactions.FirstOrDefault();
			records.AddFailed(newTx.Request, mostRecent, fiatRequested, brokerResponse.CryptoCertificate);
			return null;
		}

		private async Task<List<Data.Transaction>> UpdateMostRecentTx()
		{
			logger.LogTrace("Fetching new tx");
			var latest = await balanceAPI.GetLatestTransactions();

			// We try to merge this new list in with the one
			// we already have cached.

			// Reverse iterate over the list
			int splitPoint = IndexOfListInList(latest, recentTransactions);
			logger.LogDebug("Imported {0} new transactions from bank", (splitPoint));

			if (splitPoint != 0)
			{
				if (splitPoint == latest.Count)
				{
					// In this case, we can't find any overlap on the two lists.
					// If this happens we don't know what happened between
					// our previous check and now, (which is bad)
					if (recentTransactions.Count > 0)
					{
						logger.LogError("Could not match any tx's on latest import: check tx's for validity");
					}
				}

				// Take the tx's that didn't match, enter them into the db
				var newTxs = latest.Take(splitPoint);
				foreach (var tx in newTxs.Reverse())
					records.AddInComplete(tx);

				// now add new tx to list of current tx
				recentTransactions = newTxs.Concat(recentTransactions)
											.Take(MaxHistoryLength)
											.ToList();
			}
			return recentTransactions;
		}

		private int IndexOfListInList(List<Transaction> newerItems, List<Transaction> history)
		{
			if (history.Count == 0)
				return newerItems.Count;

			var oldFirst = history.First();
			// Iterate through subList, for each item that matches oldFirst
			// see if that sequence is then equal.
			for (int i = 0; i < newerItems.Count; i++)
			{
				if (oldFirst.Equals(newerItems[i]))
				{
					var seqLength = Math.Min(newerItems.Count - i, history.Count);
					if (history.Take(seqLength).SequenceEqual(newerItems.Skip(i).Take(seqLength)))
						return i;
				}
			}
			return newerItems.Count;
		}

		private Transaction BuildTx(TapCapBrokerPurchase brokerResponse, int fiatRequested)
		{
			var signedRequest = brokerResponse.SignedRequest;
			var rate = brokerResponse.FxRate;
			var (address, request) = Signing.GetSignerAndMessage<TapCapClientRequest>(signedRequest);

			// TODO! 
			return new Transaction()
			{
				Date = TheCoinTime.ToLocal(request.Timestamp.Value),
				FiatChange = -fiatRequested,
				FiatBalance = int.MinValue,
				Description = "Interac purchase",
				CoinChange = (int)brokerResponse.CoinCharge.Value,
				Request = new Data.ClientRequest()
				{
					ClientAddress = address,
					Message = signedRequest.Message,
					Signature = signedRequest.Signature
				},
				Rate = new Data.FXRate()
				{
					Buy = rate.Buy,
					Sell = rate.Sell,
					Target = rate.Target,
					ValidFrom = rate.ValidFrom,
					ValidTill = rate.ValidTill
				}
			};
		}
	}
}
