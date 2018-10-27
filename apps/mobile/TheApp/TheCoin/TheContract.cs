using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace TheApp.TheCoin
{
    internal class TheContract
    {
		public TheUtils.TheContract Contract;

		internal TheContract()
		{
			// Register the contract
			var assembly = typeof(App).GetTypeInfo().Assembly;
			var theContractJson = LoadResource.Load(assembly, "TheCoin.json");
			Contract = new TheUtils.TheContract(theContractJson);

			Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount);
		}

		internal void OnSetActiveAccount(Events.SetActiveAccount account)
		{
			Contract.Connect(account.Account);
		}
	}
}
