using Prism.Events;
using TheApp.TheCoin;

namespace TheApp.Events
{
	internal class BalancesUpdated : EventBase
	{
		public Balances Update;

		public BalancesUpdated() { }
		public BalancesUpdated(Balances balances)
		{
			Update = balances;
		}
	}
}
