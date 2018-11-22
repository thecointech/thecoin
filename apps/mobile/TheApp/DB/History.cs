using LiteDB;
using System;
using System.Collections.Generic;
using System.Text;
using TapCapSupplier.Client.Model;

namespace TheApp.DB
{
	class RequestedTx
	{

	}
	class CompletedTx
	{
		// Primary key, this is the timestamp of the tx
		public long Id { get; set; }

		// The complete message returned from the supplier
		// This is stored so if anything goes wrong in the
		// future we can prove the tx message we received.
		public SignedMessage Response { get; set; }

		// The coin charged for this tx
		public long CoinCharge { get; set; }

		// The exchange rate charged by the broker
		// NOTE: This should match the official records
		public double FxRate;

		// The address of the supplier - whoever signed this message
		public string SupplierAddress;
	}

	
	class History
    {
		private LiteDatabase db = new LiteDatabase("tx.db");
		LiteCollection<RequestedTx> requested;
		LiteCollection<CompletedTx> completed;

		History()
		{
			requested = db.GetCollection<RequestedTx>("requests");
			completed = db.GetCollection<CompletedTx>("complete");

			Events.EventSystem.Subscribe<Events.TxStatus>(RecordTx);
		}

		void RecordTx(Events.TxStatus status)
		{
			var txResponse = status.SignedResponse;
			var (address, response) = TheUtils.Signing.GetSignerAndMessage<TapCapBrokerPurchase>(txResponse);

			var tx = new CompletedTx()
			{
				Id = TheUtils.TheCoinTime.Now(),
				Response = txResponse,
				CoinCharge = response.CoinCharge.Value,
				FxRate = response.FxRate.Sell.Value,
				SupplierAddress = address
			};

			completed.Insert(tx);
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
