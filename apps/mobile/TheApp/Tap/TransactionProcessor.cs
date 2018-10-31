using Newtonsoft.Json;
using NLog;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
		private AppResponseCache Cache;
		private UserAccount UserAccount;
		private List<PDOL.PDOLItem> GpoPDOL;
		private byte[] GpoData;

		private QueryWithHistory queryHistory;
		private List<byte[]> TxQueries = new List<byte[]>();
		private List<byte[]> TxResponses = new List<byte[]>();

		private Stopwatch stopwatch;

		private SubscriptionToken _statusUpdatedSub;
		private long ticksAtCompletion;
		private SignedMessage cachedTapResponse;

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
			if (Cache == null && UserAccount != null && UserAccount.Status != null)
			{ 
				try
				{
					var (m, s) = Signing.GetMessageAndSignature(UserAccount.Status.SignedToken, UserAccount.TheAccount);
					var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s));
					Cache = new AppResponseCache(supplierResponses);
					Events.EventSystem.Unsubscribe<Events.StatusUpdated>(_statusUpdatedSub);

					GpoPDOL = PDOL.ParsePDOLItems(supplierResponses.GpoPdol);

					//StaticTypes = StaticResponses.Responses.Select((response) => ReadApduType(response.Query)).ToArray();
					ResetTransaction();
					Events.EventSystem.Publish(new Events.TxStatus(0));
				}
				catch(Exception e)
				{
					logger.Error(e, "Could not initialize TxProcessor");
				}
			}
		}

		public byte[] ProcessCommand(byte[] query)
		{
			if (TxQueries.Count == 0)
			{
				OnStartTx();
			}

			Events.EventSystem.Publish(new Events.TxStatus(TxQueries.Count));

			queryHistory.Query = query;

			var type = Processing.ReadApduType(query);
			logger.Trace("Recieved: {0} - {1}", type.ToString(), BitConverter.ToString(query));
			if (type != Processing.ApduType.CyrptoSig)
			{
				var response = GetCachedResponse(query, type);
				logger.Trace("Cached Response: {0}", BitConverter.ToString(response));
				return response;
			}

			// TODO: This would be faster if we just sent the whole data struct
			//var cryptoPdol = Processing.FindValue(query, new string[] { "70", "8C" });
			// Else, if this is a purchase PDOL, then query server
			var purchaseCert = GetSupplierTap(query);
			logger.Trace("Fetched Response: {0}", BitConverter.ToString(purchaseCert));
			ticksAtCompletion = stopwatch.ElapsedTicks;
			return purchaseCert;

		}

		public void Terminated()
		{
			// See OnDeactivated for notification beep.
			ValidateTx();
			ResetTransaction();
		}

		private void OnStartTx()
		{
			logger.Trace("--- Start New Tx ---");
			stopwatch = Stopwatch.StartNew();
			try
			{
				// Or use specified time
				var duration = TimeSpan.FromMilliseconds(150);
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

		private byte[] GetCachedResponse(byte[] query, Processing.ApduType type)
		{
			if (type == Processing.ApduType.GPO)
			{
				CachePDOLData(query);
			}
			var response = Cache.GetResponse(query);

			if (response == null)
			{
				response = TapSupplier.GetStaticSingle(queryHistory);
				var str = Encoding.UTF8.GetString(response, 0, response.Length);
				response = Convert.FromBase64String(str);
				Cache.AddNewStaticResponse(query, response);
			}
			// Keep running track of this tx
			queryHistory.Queries.Add(query);
			queryHistory.Responses.Add(response);

			return response;
		}

		private byte[] GetSupplierTap(byte[] cryptoData)
		{
			var timestamp = TheCoinTime.Now();
			var mtoken = UserAccount.Status.SignedToken;
			var token = new SignedMessage(mtoken.Message, mtoken.Signature);
			TapCapClientRequest request = new TapCapClientRequest(timestamp, GpoData, cryptoData, token);

			var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
			var signedMessage = new SignedMessage(m, s);
			cachedTapResponse = TapSupplier.RequestTapCap(signedMessage);

			if (cachedTapResponse != null)
			{
				//logger.Trace("Results {0}, took {1}ms", cachedTapResponse, TheCoinTime.Now() - timestamp);

				// Do not decode the signing address of this, instead just extract the relevant info
				var purchase = JsonConvert.DeserializeObject<TapCapBrokerPurchase>(cachedTapResponse.Message);
				return purchase.CryptoCertificate;
			}
			logger.Error("Did not recieve response to crypto request");
			return null;
		}

		private void ValidateTx()
		{
			// Now check that the whatsit all went swimmingly.
			//ParsePDOLData(GPOData, GPOItems);
			if (cachedTapResponse == null)
			{
				logger.Debug("Premature Exit at " + stopwatch.ElapsedMilliseconds);
				return;
			}

			var sinceComplete = (stopwatch.ElapsedTicks - ticksAtCompletion) / (Stopwatch.Frequency / 1000.0);
			var dbgMessage = String.Format("Deactivated: sinceComplete: {0}, total {1}ms", sinceComplete, stopwatch.ElapsedMilliseconds);
			logger.Info(dbgMessage);

			if (sinceComplete >= 0)
			{
				// Check that our disconnection was as expected.
				Events.EventSystem.Publish(new Events.TxStatus() { SignedResponse = cachedTapResponse });
			}
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
			Cache.ResetTx();
			queryHistory = new QueryWithHistory(new byte[0], new List<byte[]>(), new List<byte[]>());
			cachedTapResponse = null;
			ticksAtCompletion = 0;
		}
	}
}
