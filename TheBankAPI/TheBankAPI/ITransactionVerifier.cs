using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace TheBankAPI
{
	public interface ITransactionVerifier
	{
		Task InitializeTask();

		Task<Transaction> MatchTx(ulong amount);

		Transaction GetLatestTx();
	}
}
