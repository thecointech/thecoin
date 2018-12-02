using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapManager.Client.Model;

namespace TapCapSupplier.Server.DB
{
	/// <summary>
	/// 
	/// </summary>
	public class ClientRequest : SignedMessage
	{
		/// <summary>
		/// Add a DB id to the SignedMessage
		/// </summary>
		public int ID { get; set; }

		/// <summary>
		/// The amount of $$ requested
		/// </summary>
		public double FiatRequested { get; set; }

		/// <summary>
		/// The client address - extracted from the signed message
		/// </summary>
		public string ClientAddress { get; set; }
	}

	/// <summary>
	/// Add a DB id to the FxRate returned from ThePricing API
	/// </summary>
	public class FXRate : TapCapManager.Client.Model.FXRate
	{
		/// <summary>
		/// Add a DB id to the FxRate returned from ThePricing API
		/// </summary>
		public int ID { get; set; }
	}

	/// <summary>
	/// 
	/// </summary>
	public class TransactionComplete
	{
		/// <summary>
		/// Add a DB id to the FxRate returned from ThePricing API
		/// </summary>
		public int ID { get; set; }

		/// <summary>
		/// The full signed(TapCapClientRequest) received from the client
		/// </summary>
		public ClientRequest Request { get; set; }

		/// <summary>
		/// The FxRate at the time of the request
		/// </summary>
		public FXRate Rate { get; set; }

		/// <summary>
		/// The amount of coin charged to cover the fiat requested
		/// </summary>
		public long CoinCharged { get; set; }

		/// <summary>
		/// Any ID for the transaction (scraped from the fiat account statement)
		/// </summary>
		public string MerchantId { get; set; }
	}

	/// <summary>
	/// Stored whenever a transaction request fails (is this necessary?)
	/// </summary>
	public class TransactionFailed
	{
		public int ID { get; set; }
		/// <summary>
		/// The full signed(TapCapClientRequest) received from the client
		/// </summary>
		public ClientRequest Request { get; set; }

		/// <summary>
		/// Current bank balance
		/// </summary>
		public uint CurrentBalance { get; set; }

		/// <summary>
		/// Amount of the last registered tx
		/// </summary>
		public int LastTxAmount { get; set; }
	}
}
