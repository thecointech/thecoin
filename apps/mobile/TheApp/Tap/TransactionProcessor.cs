using Newtonsoft.Json;
using NLog;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Linq;
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
		private Logger logger = LogManager.GetCurrentClassLogger();

		private ITransactionApi TapSupplier;
		private StaticResponses StaticResponses;
		private ApduType[] StaticTypes;
		private UserAccount UserAccount;
		private List<PDOL.PDOLItem> GpoPDOL;
		private byte[] GpoData;

		// Count how many files have been read by the system
		private int FileCounter = 0;
		private bool FirstTxMessage => FileCounter < 0;
		private int MessageCounter = 0;

		private System.Diagnostics.Stopwatch stopwatch;

		private SubscriptionToken _statusUpdatedSub;

		public TransactionProcessor(UserAccount userAccount, ITransactionApi supplier)
		{
			UserAccount = userAccount;
			TapSupplier = supplier;

			_statusUpdatedSub = Events.EventSystem.Subscribe<Events.StatusUpdated>(OnStatusUpdated);
			Task.Run(FetchStaticResponses);
		}

		internal void OnStatusUpdated(Events.StatusUpdated update)
		{
			Task.Run(FetchStaticResponses);
		}

		async Task FetchStaticResponses()
		{
			if (StaticResponses == null && UserAccount != null && UserAccount.Status != null)
			{ 
				try
				{
					var (m, s) = Signing.GetMessageAndSignature(UserAccount.Status.SignedToken, UserAccount.TheAccount);
					var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s));
					StaticResponses = supplierResponses;
					Events.EventSystem.Unsubscribe<Events.StatusUpdated>(_statusUpdatedSub);

					GpoPDOL = PDOL.ParsePDOLItems(StaticResponses.GpoPdol);

					StaticTypes = StaticResponses.Responses.Select((response) => ReadApduType(response.Query)).ToArray();
					ResetTransaction();
				}
				catch(Exception e)
				{
					logger.Error(e, "Could not initialize TxProcessor");
				}
			}
		}

		public byte[] ProcessCommand(byte[] query)
		{
			if (MessageCounter++ == 0)
			{
				OnStartTx();
			}
			var type = ReadApduType(query);
			if (type != ApduType.CyrptoSig)
				return GetCachedResponse(query, type);

			// TODO: This would be faster if we just sent the whole data struct
			//var cryptoPdol = Processing.FindValue(query, new string[] { "70", "8C" });
			// Else, if this is a purchase PDOL, then query server
			return GetSupplierTap(query);
		}

		public void Terminated()
		{
			// See OnDeactivated for notification beep.

			logger.Info("Deactivated: after {1}ms", stopwatch?.ElapsedMilliseconds);
			ResetTransaction();
		}

		private void OnStartTx()
		{
			stopwatch = System.Diagnostics.Stopwatch.StartNew();
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

		private byte[] GetCachedResponse(byte[] query, ApduType type)
		{
			if (type == ApduType.GetPdo)
			{
				CachePDOLData(query);
			}

			for (int i = 0; i < StaticTypes.Length; i++)
			{
				if (StaticTypes[i] == type)
					return StaticResponses.Responses[i].Response;
			}

			logger.Error("Could not get response for type{0}, command: {1}", type.ToString(), BitConverter.ToString(query));
			return null;
		}

		private byte[] GetSupplierTap(byte[] cryptoData)
		{
			var timestamp = TheCoinTime.Now();
			var mtoken = UserAccount.Status.SignedToken;
			var token = new SignedMessage(mtoken.Message, mtoken.Signature);
			TapCapClientRequest request = new TapCapClientRequest(timestamp, GpoData, cryptoData, token);

			var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
			var signedMessage = new SignedMessage(m, s);
			var signedTap = TapSupplier.RequestTapCap(signedMessage);

			logger.Info("Results {0}", signedTap);

			// Do not decode the signing address of this, instead just extract the relevant info
			var purchase = JsonConvert.DeserializeObject<TapCapBrokerPurchase>(signedTap.Message);
			
			// TODO: Speed this whole shebang up!!!
			ConfirmTx(signedTap);

			return purchase.CryptoCertificate;
		}

		private async Task ConfirmTx(SignedMessage purchase)
		{
			// Wait so many seconds, then publish
			await Task.Delay(300);

			// Now check that the whatsit all went swimmingly.
			//ParsePDOLData(GPOData, GPOItems);

			// Check that our disconnection was as expected.
			Events.EventSystem.Publish(new Events.TxCompleted() { SignedResponse = purchase });
		}

		private void CachePDOLData(byte[] commandApdu)
		{
			// Assuming this is a 
			var gpoLen = commandApdu[4];
			GpoData = commandApdu.Skip(5).Take(gpoLen).ToArray();
		}

		// We assume files are always 
		public void ResetTransaction()
		{
			MessageCounter = 0;
			FileCounter = 0;
		}

		private ApduType ReadApduType(byte[] commandApdu)
		{
			if (commandApdu.Length < 5)
				return ApduType.ErrorType;

			// Select command?
			else if (commandApdu[0] == 0x00 && commandApdu[1] == 0xA4 && commandApdu[2] == 0x04 && commandApdu[3] == 0x00)
			{
				if (commandApdu[4] == 0x0E && commandApdu[5] == 0x32 && commandApdu[6] == 0x50)
					return ApduType.Select1;
				else
					return ApduType.Select2;
			}
			// Check if requesting GPO
			else if (commandApdu[0] == 0x80 && commandApdu[1] == 0xA8 && commandApdu[2] == 0x00 && commandApdu[3] == 0x00)
			{
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
	}
}
