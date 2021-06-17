using System.Threading.Tasks;

namespace TheBankAPI
{
	public interface ITransactionVerifier
	{
		Task<Data.Transaction> MatchTx(/*TapCapManager.Client.Model.TapCapBrokerPurchase clientRequest, */ long timestamp, int fiatRequested);
	}
}
