using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using TapCapSupplier.Client.Model;
using Xamarin.Essentials;

namespace TheApp.DB
{
	public class Records
    {
		private LiteDatabase db;
		private LiteCollection<RequestedTx> requested;
		private LiteCollection<CompletedTx> completed;

		public Records()
		{
			var appDir = FileSystem.AppDataDirectory;
			db = new LiteDatabase(appDir + "/tx.db");
			requested = db.GetCollection<RequestedTx>("requests");
			completed = db.GetCollection<CompletedTx>("complete");

			Events.EventSystem.Subscribe<Events.TxStatus>(RecordTx);
		}

		void RecordTx(Events.TxStatus status)
		{
			if (status.SignedResponse != null)
			{
				var txResponse = status.SignedResponse;
				var (address, response) = TheUtils.Signing.GetSignerAndMessage<TapCapBrokerPurchase>(txResponse);
				var (clientAddress, request) = TheUtils.Signing.GetSignerAndMessage<TapCapClientRequest>(response.SignedRequest);

				var tx = new CompletedTx()
				{
					Id = TheUtils.TheCoinTime.Now(),
					Response = txResponse,
					FiatRequested = status.Amount,
					CoinCharge = response.CoinCharge.Value,
					ClientAddress = clientAddress,
					SupplierAddress = address
				};

				completed.Insert(tx);
			}
		}

		IEnumerable<CompletedTx> GetCompletedTx(long since, long until)
		{
			var results = completed.Find(Query.And(
				Query.GTE("Id", since),
				Query.LT("Id", until)
			));

			return results;
		}
    }
}
