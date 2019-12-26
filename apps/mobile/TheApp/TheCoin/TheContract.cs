using System.Threading.Tasks;

namespace TheApp.TheCoin
{
    public class TheContract
    {
		public TheUtils.TheContract Contract;

		public TheContract()
		{
			// Register the contract
			Task.Run(async () =>
			{
				var theContractJson = await LoadResource.Load("TheCoin.json");
				Contract = new TheUtils.TheContract(theContractJson);
			});

			Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount);
		}

		internal void OnSetActiveAccount(Events.SetActiveAccount account)
		{
			Contract.Connect(account.Account);
		}
	}
}
