using Prism.Events;
using TheApp.TheCoin;

namespace TheApp.Events
{
	internal class SetActiveAccount : EventBase
	{
		public UserAccount Account;

		public SetActiveAccount() { }
		public SetActiveAccount(UserAccount account)
		{
			Account = account;
		}
	}
}
