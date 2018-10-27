using NLog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Model;
using TheApp.TheCoin;
using TheUtils;
using Xamarin.Essentials;

namespace TheApp.Tap
{
	public class TransactionProcessor
	{
		private ITransactionApi TapSupplier;
		private StaticResponses StaticResponses;
		private UserAccount UserAccount;

		private Logger logger = LogManager.GetCurrentClassLogger();

		public TransactionProcessor(UserAccount userAccount, ITransactionApi supplier)
		{
			UserAccount = userAccount;
			TapSupplier = supplier;

			Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount);
		}

		internal void OnSetActiveAccount(Events.SetActiveAccount activeAccount)
		{
			var account = activeAccount.Account;
			if (account != null)
			{
				Task.Run(async () =>
				{
					var (m, s) = Signing.GetMessageAndSignature(UserAccount.Status.SignedToken, UserAccount.TheAccount);
					var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s));
					StaticResponses = supplierResponses;
				});
			}
		}

		public byte[] ProcessCommand(byte[] query)
		{
			foreach (var response in StaticResponses.Responses)
			{
				if (query == response.Query)
					return response.Response;
			}

			// Else, if this is a purchase PDOL, then query server
			return null;
		}

		public void Terminated()
		{
			//logger.Info("Deactivated: {0} after {1}ms", reason.ToString(), stopwatch?.ElapsedMilliseconds);
		}

		private void OnStartTx()
		{
			ResetTransaction();
			try
			{
				// Or use specified time
				var duration = TimeSpan.FromSeconds(1);
				Vibration.Vibrate(duration);
			}
			catch (FeatureNotSupportedException /*ex*/)
			{
				// Feature not supported on device
				// TODO: Figure a different notification
			}
			catch (Exception ex)
			{
				logger.Error(ex, "Couldn't vibrate");
				// Other error has occurred.
			}
		}

		private byte[] GetResponse(byte[] command)
		{
			var type = ReadApduType(command);
			// Never cache a signature
			if (type == ApduType.CyrptoSig)
				return null;

			return null;
			//var storage = SimpleStorage.EditGroup(ConnectionId);
			//var results = storage.Get<byte[]>(GetCmdName(command));
			//return results;
		}

		private void CachePDOLData(byte[] commandApdu)
		{
			// Assuming this is a 
			//var gpoLen = commandApdu[4];
			//var data = commandApdu.Skip(5).Take(gpoLen).ToArray();
			//GPOData = ByteString.CopyFrom(data);

			//ParsePDOLData(GPOData, GPOItems);
		}

		// We assume files are always 
		private int FileCounter = 0;
		public void ResetTransaction()
		{
			FileCounter = 0;
		}

		private ApduType ReadApduType(byte[] commandApdu)
		{
			if (commandApdu.Length < 5)
				return ApduType.ErrorType;

			// Select command?
			else if (commandApdu[0] == 0x00 && commandApdu[1] == 0xA4 && commandApdu[2] == 0x04 && commandApdu[3] == 0x00)
			{
				if (commandApdu[0] == 0x0E && commandApdu[1] == 0x32 && commandApdu[2] == 0x50)
					return ApduType.Select1;
				else
					return ApduType.Select2;
			}
			// Check if requesting GPO
			else if (commandApdu[0] == 0x80 && commandApdu[1] == 0xA8 && commandApdu[2] == 0x00 && commandApdu[3] == 0x00)
			{
				CachePDOLData(commandApdu);
				return ApduType.GetPdo;
			}
			// Else most likely ReadRequest
			else if (commandApdu[0] == 0x00 && commandApdu[1] == 0xB2)
			{
				return ApduType.ReadFile1 + FileCounter++;
			}
			// Else it might be a crypto request
			else if (commandApdu[0] == 0x80 && commandApdu[1] == 0xAE)
				return ApduType.CyrptoSig;

			// If unknown we mark it as an error.
			return ApduType.ErrorType;
		}

		private enum ApduType
		{
			ErrorType = 0,
			Select1 = 1,
			Select2 = 2,
			GetPdo = 3,
			ReadFile1 = 4,
			ReadFile2 = 5,
			ReadFile3 = 6,
			ReadFile4 = 7,
			ReadFile5 = 8,
			CyrptoSig = 9,
		}

		internal async Task<bool> TryTestTx()
		{
			if (StaticResponses == null)
				return false;

			try
			{
				const ulong amt = 123;
				var gpoData = StaticResponses.GpoPdol;
				var cryptData = StaticResponses.CryptoPdol;

				// Normally this would get sent back to the client to be filled by the terminal
				var gpoParsed = PDOL.ParsePDOLItems(gpoData);
				PDOL.FillWithDummyData(gpoParsed, amt);

				var cryptParsed = PDOL.ParsePDOLItems(cryptData);
				PDOL.FillWithDummyData(cryptParsed, amt);

				var timestamp = TheCoinTime.Now();
				var mtoken = UserAccount.Status.SignedToken;
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
