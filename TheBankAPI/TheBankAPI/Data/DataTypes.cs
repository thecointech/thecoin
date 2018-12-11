using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapManager.Client.Model;

namespace TheBankAPI.Data
{
	/// <summary>
	/// 
	/// </summary>
	public class ClientRequest : SignedMessage
	{
		/// <summary>
		/// Add a DB id to the SignedMessage
		/// </summary>
		[BsonId]
		public int ID { get; set; }

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
		[BsonId]
		public int ID { get; set; }
	}

	/// <summary>
	/// 
	/// </summary>
	public class Transaction
	{
		/// <summary>
		/// Add a DB id to the FxRate returned from ThePricing API
		/// </summary>
		[BsonId]
		public int ID { get; set; }

		/// <summary>
		/// DateTime of the transaction.  May be sourced from either
		/// bank account or directly from client
		/// </summary>
		public DateTime Date { get; set; }

		/// <summary>
		/// Amount in cents of the bank balance following tx completion
		/// </summary>
		public int FiatBalance { get; set; }

		/// <summary>
		/// Amount of cents in this tx
		/// -ve if withdrawal, +ve if deposit
		/// </summary>
		public int FiatChange { get; set; }

		/// <summary>
		/// Tx description scraped from bank website
		/// </summary>
		public string Description { get; set; }

		/// <summary>
		/// The full signed(TapCapClientRequest) received from the client
		/// May be null if this tx is not matched with a client request
		/// </summary>
		[BsonRef("requests")]
		public ClientRequest Request { get; set; }

		/// <summary>
		/// The FxRate at the time of the request.
		/// May be null if this tx is not matched with a client request
		/// </summary>
		[BsonRef("rates")]
		public FXRate Rate { get; set; }

		/// <summary>
		/// The amount of coin charged to cover the fiat requested
		/// +ve if user purchased coinage (we received deposit), else -ve
		/// </summary>
		public int CoinChange { get; set; }

		/// <summary>
		/// Override equals to enable fuzzy matching
		/// </summary>
		/// <param name="other"></param>
		/// <returns></returns>
		public bool Equals(Transaction other)
		{
			if (other is null)
				return false;

			return FuzzyMatches(other);
		}

		public override bool Equals(object obj) => Equals(obj as Transaction);
		public override int GetHashCode() => (Date, FiatBalance, FiatChange, Description).GetHashCode();

		bool FuzzyMatches(Transaction other)
		{
			// Our date might not match if the request is sent just before midnight and the
			// purchase is processed just after. RHS
			return FuzzyMatches(Date, other.Date) &&
				(FiatBalance == other.FiatBalance || other.FiatBalance == int.MinValue) &&
				FiatChange == other.FiatChange &&
				FuzzyMatches(Description, other.Description);
		}

		bool FuzzyMatches(DateTime justDate, DateTime dateAndTime)
		{
			// justDate will be offset forwards on weekends
			if (dateAndTime.DayOfWeek == DayOfWeek.Saturday)
				return (justDate - dateAndTime) < TimeSpan.FromDays(2);
			if (dateAndTime.DayOfWeek == DayOfWeek.Sunday)
				return (justDate - dateAndTime) < TimeSpan.FromDays(1);

			return justDate == dateAndTime.Date || justDate == (dateAndTime + TimeSpan.FromSeconds(30)).Date;
		}

		bool FuzzyMatches(string desc, string otherdesc)
		{
			return desc.Contains(otherdesc) || otherdesc.Contains(desc);
		}
	}

	/// <summary>
	/// Stored whenever a transaction request fails (is this necessary?)
	/// </summary>
	public class TransactionFailed
	{
		/// <summary>
		/// DB generated id
		/// </summary>
		[BsonId]
		public int ID { get; set; }

		/// <summary>
		/// The full signed(TapCapClientRequest) received from the client
		/// </summary>
		[BsonRef("requests")]
		public ClientRequest Request { get; set; }

		/// <summary>
		/// The amount of $$ (in cents) requested
		/// </summary>
		public int FiatRequested { get; set; }

		/// <summary>
		/// The signed response sent to the client
		/// </summary>
		public byte[] Response { get; set; }

		/// <summary>
		/// Most recent completed tx from the bank
		/// </summary>
		[BsonRef("tx")]
		public Transaction LastTransaction;
	}
}
