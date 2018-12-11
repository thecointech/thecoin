using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Nethereum.Web3.Accounts;
using System;
using System.IO;
using Microsoft.Extensions.DependencyInjection;

namespace TapCapSupplier.Server.TapCap
{
	internal static class AccountFactory
	{
		internal static Account Load(IServiceProvider services)
		{
			var env = services.GetService<IHostingEnvironment>();
			var config = services.GetService<IConfiguration>();
			var accountPath = Utils.Utils.GetDataPath(env, "account.json");
			var key = config["AccountKey"];

			using (StreamReader reader = File.OpenText(accountPath))
			{
				var encryptedAccount = reader.ReadToEnd();
				return Account.LoadFromKeyStore(encryptedAccount, key);
			}
		}
	}
}
