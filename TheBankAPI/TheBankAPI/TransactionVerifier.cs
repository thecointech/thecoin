using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace TheBankAPI
{
	class TransactionVerifier : ITransactionVerifier
	{
		//TransactionVerifier();
		public Transaction GetLatestTx()
		{
			throw new NotImplementedException();
		}

		public Task InitializeTask() 
		{
			throw new NotImplementedException();
		}

		public Task<Transaction> MatchTx(ulong amount)
		{
			throw new NotImplementedException();
		}
	}
}
