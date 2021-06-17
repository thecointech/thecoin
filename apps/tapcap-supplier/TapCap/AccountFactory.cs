using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Nethereum.Web3.Accounts;
using System;
using System.IO;
using Microsoft.Extensions.DependencyInjection;

namespace TapCapSupplier.TapCap
{
	internal static class AccountFactory
	{
		internal static Account Load(IConfiguration config)
		{
			var accountPath = config["WALLET_BrokerCAD_PATH"];
			var key = config["WALLET_BrokerCAD_PWD"];

			using (StreamReader reader = File.OpenText(accountPath))
			{
				var encryptedAccount = reader.ReadToEnd();
				return Account.LoadFromKeyStore(encryptedAccount, key);
			}
		}
	}
}
