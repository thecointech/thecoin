using NLog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Model;
using TheApp.TheCoin;
using TheUtils;

namespace TheApp.Tap
{
	public class TransactionProcessor
	{
		private ITransactionApi TapSupplier;
		private StaticResponses StaticResponses;
		private UserAccount UserAccount;

		private Logger logger = LogManager.GetCurrentClassLogger();

		private Task __initializeTask;

		public TransactionProcessor(UserAccount userAccount, ITransactionApi supplier)
		{
			UserAccount = userAccount;
			TapSupplier = supplier;
			__initializeTask = Task.Run(AsyncInit);
		}

		internal async Task AsyncInit()
		{
			await UserAccount.MakeReady();
			var (m, s) = Signing.GetMessageAndSignature(UserAccount.TapStatus.SignedToken, UserAccount.TheAccount);
			var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s));
			StaticResponses = supplierResponses;
		}

		// This must be called before this class can be used
		internal Task MakeReady()
		{
			return __initializeTask;
		}

		internal byte[] GetResponse(byte[] query)
		{

			foreach (var response in StaticResponses.Responses)
			{
				if (query == response.Query)
					return response.Response;
			}

			// Else, if this is a purchase PDOL, then query server
			return null;
		}

		internal async Task<bool> TryTestTx()
		{
			try
			{
				var gpoData = StaticResponses.GpoPdol;
				var cryptData = StaticResponses.CryptoPdol;

				// Normally this would get sent back to the client to be filled by the terminal
				var gpoParsed = PDOL.ParsePDOLItems(gpoData);
				PDOL.FillWithDummyData(gpoParsed);

				var cryptParsed = PDOL.ParsePDOLItems(cryptData);
				PDOL.FillWithDummyData(cryptParsed);

				var timestamp = TheCoinTime.Now();
				var mtoken = UserAccount.TapStatus.SignedToken;
				var token = new SignedMessage(mtoken.Message, mtoken.Signature);
				TapCapClientRequest request = new TapCapClientRequest(timestamp, PDOL.GeneratePDOL(gpoParsed), PDOL.GenerateCDOL(cryptParsed), token);

				var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
				var signedMessage = new SignedMessage(m, s);
				var tapCap = await TapSupplier.RequestTapCapAsync(signedMessage);
				
				logger.Info("Results {0}", tapCap);

				if (tapCap != null)
				{
					Events.EventSystem.Publish(new Events.TxCompleted()
					{
						SignedResponse = tapCap
					});
				}
				return true;
			}
			catch (Exception e)
			{
				logger.Error(e, "Test Tx");
			}
			return false;
		}
	}
}
