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

		// The amount of $ requested
		public double FiatRequested { get; set; }

		// The coin charged for this tx
		public long CoinCharge { get; set; }

		// The address of the supplier - whoever signed this message
		public string SupplierAddress { get; set; }

		// The address of the account requesting this tx
		public string ClientAddress { get; set; }
	}
}
