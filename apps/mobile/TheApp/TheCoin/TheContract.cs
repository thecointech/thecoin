using System.Threading.Tasks;

namespace TheApp.TheCoin
{
    public class TheContract
    {
		public TheUtils.TheContract Contract;

		public TheContract()
		{
			// Register the contract
			_ = Task.Run(async () =>
			  {
				  var theContractJson = await LoadResource.Load("TheCoin.json");
				// Production Account
				Contract = new TheUtils.TheContract(theContractJson, "0x6ff8a26a831c15b316671ffc8e2b2cfa7d918530");
			  });

			Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount);
		}

		internal void OnSetActiveAccount(Events.SetActiveAccount account)
		{
			Contract.Connect(account.Account);
		}
	}
}
