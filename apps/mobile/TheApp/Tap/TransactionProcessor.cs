using Newtonsoft.Json;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
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
		private static NLog.Logger logger = NLog.LogManager.GetCurrentClassLogger();

		private ITransactionApi TapSupplier;
		private AppResponseCache Cache;
		private UserAccount UserAccount;
		private List<PDOL.PDOLItem> GpoPDOL;
		private byte[] GpoData;
		private double FiatRequested;
		private string SupplierAddress;

		private QueryWithHistory queryHistory;

		private Stopwatch stopwatch;

		private SubscriptionToken _statusUpdatedSub;
		private long ticksAtCompletion;
		private SignedMessage cachedTapResponse;

		public TransactionProcessor(UserAccount userAccount, ITransactionApi supplier)
		{
			UserAccount = userAccount;
			TapSupplier = supplier;

			_statusUpdatedSub = Events.EventSystem.Subscribe<Events.StatusUpdated>(OnStatusUpdated);
			FetchStaticResponses();
		}

		internal void OnStatusUpdated(Events.StatusUpdated update)
		{
			FetchStaticResponses();
		}

		internal void PublishStatus(string message)
		{
			Events.EventSystem.Publish(new Events.TxStatus("Step: " + queryHistory.Queries.Count, FiatRequested));
		}

		async void FetchStaticResponses()
		{
			try
			{
				logger.Info("Maybe fetching");
				if (Cache == null && UserAccount != null && UserAccount.Status != null)
				{
					logger.Info("Probably fetching");
					Events.EventSystem.Unsubscribe<Events.StatusUpdated>(_statusUpdatedSub);

					var (m, s) = Signing.GetMessageAndSignature(UserAccount.Status.SignedToken, UserAccount.TheAccount);
					var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s)).ConfigureAwait(false);
					Cache = new AppResponseCache(supplierResponses);
					SupplierAddress = supplierResponses.Address;
					logger.Info("Loaded Cache: {0}", supplierResponses.ToJson());

					// Cache the Gpo PDOL structure
					GpoPDOL = PDOL.ParsePDOLItems(supplierResponses.GpoPdol);

					ResetTransaction();
					Events.EventSystem.Publish(new Events.TxStatus());
				}
			}
			catch (Exception e)
			{
				logger.Error(e, "Could not initialize TxProcessor");
			}
		}

		public async Task<byte[]> ProcessCommand(byte[] query)
		{
			var type = Processing.ReadApduType(query);
			// Select1 is basically ATR
			if (type == Processing.ApduType.Select1)
			{
				OnStartTx();
			}

			byte[] response = null;
			try
			{
				logger.Trace("{0}  {1}", type.ToString(), BitConverter.ToString(query));

				PublishStatus("Step: " + queryHistory.Queries.Count);
				queryHistory.Query = query;

				// For all non-crypto-sig requests, we rely on the cache
				if (type != Processing.ApduType.CyrptoSig)
				{
					response = await GetCachedResponse(query, type);
				}
				else
				{
					var cryptoData = Processing.ExtractDataFromApdu(query);
					response = await GetSupplierTap(cryptoData.ToArray());
					ticksAtCompletion = stopwatch.ElapsedTicks;
				}

				logger.Trace("Response: {0}", BitConverter.ToString(response));

			}
			catch (TapCapSupplier.Client.Client.ApiException e)
			{
				if (e.ErrorCode == 405)
				{
					logger.Error("Supplier Error: {0}", e.Message);
					ErrorMessage error = JsonConvert.DeserializeObject<ErrorMessage>(e.ErrorContent);
					PublishStatus("ERROR: " + error.Message);

					var _ = Task.Run(async () =>
					{
						await Task.Delay(15000);
						Events.EventSystem.Publish(new Events.TxStatus());
					});
				}
			}
			catch (Exception e)
			{
				logger.Error("Fix this now!, {0}", e.Message);
				Events.EventSystem.Publish(new Events.TxStatus("ERROR: " + e.Message));
			}
			return response;

		}

		public void Terminated(string reason)
		{
			
			logger.Trace("--- Deactivated : {0} ---", reason);
			try
			{
				System.Threading.Thread.EndThreadAffinity();

				// See OnDeactivated for notification beep.
				ValidateTx(cachedTapResponse, FiatRequested, ticksAtCompletion, stopwatch);
				ResetTransaction();
			}
			catch (Exception e)
			{
				logger.Error(e, "Exception on terminated!");
			}

		}

		private void OnStartTx()
		{
			if (queryHistory.Queries.Count > 0)
				ResetTransaction();

			logger.Trace("--- Start New Tx ---");
			try
			{
				System.Threading.Thread.BeginThreadAffinity();
				stopwatch = Stopwatch.StartNew();

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

		private void WaitFetch(Task fetchTask, string msg)
		{
			for (var i = 0; i < 20; i++)
			{
				if (fetchTask.IsCompleted)
				{
					PublishStatus("Fetch Success");
					break;
				}

				Task[] taskArray = { fetchTask, Task.Delay(200) };
				Task.WaitAny(taskArray);
				var logMsg = String.Format("Step: {0} - {1} ({2}ms)", queryHistory.Queries.Count, msg, i * 200);
				PublishStatus(logMsg);
				logger.Trace(logMsg);
			}
		}
		private async Task<byte[]> GetCachedResponse(byte[] query, Processing.ApduType type)
		{
			if (type == Processing.ApduType.GPO)
			{
				CachePDOLData(query);
			}

			logger.Trace("Searching from last: " + Cache.ParentIndex);
			var response = Cache.GetResponse(query);

			if (response == null)
			{
				logger.Trace("Not found in cache - Fetching remote response");
				PublishStatus("Step: " + queryHistory.Queries.Count + " - Doing remote fetch");
				var responseTask = TapSupplier.GetStaticSingleAsync(queryHistory);
				WaitFetch(responseTask, "Doing remote fetch");
				var serverResponse = await responseTask;
				logger.Trace("Fetch Success: " + (serverResponse != null));
				response = serverResponse.Response;
				Cache.AddNewStaticResponse(query, response);
			}
			// Keep running track of this tx
			queryHistory.Queries.Add(query);
			queryHistory.Responses.Add(response);

			return response;
		}

		private async Task<byte[]> GetSupplierTap(byte[] cryptoData)
		{
			var timestamp = TheCoinTime.Now();
			var mtoken = UserAccount.Status.SignedToken;
			var token = new SignedMessage(mtoken.Message, mtoken.Signature);
			TapCapClientRequest request = new TapCapClientRequest(timestamp, GpoData, cryptoData, SupplierAddress, token);

			var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
			var signedMessage = new SignedMessage(m, s);

			logger.Trace("Fetching purchase cert");
			PublishStatus("Step: " + queryHistory.Queries.Count + " - Fetching Cert");

			var responseTask = TapSupplier.RequestTapCapAsync(signedMessage);
			WaitFetch(responseTask, "Fetching Cert");
			cachedTapResponse = await responseTask;
			logger.Trace("Fetch Success: " + (cachedTapResponse != null));
			if (cachedTapResponse != null)
			{
				logger.Trace("Results {0}, took {1}ms", cachedTapResponse, TheCoinTime.Now() - timestamp);

				// Do not decode the signing address of this, instead just extract the relevant info
				var purchase = JsonConvert.DeserializeObject<TapCapBrokerPurchase>(cachedTapResponse.Message);
				return purchase.CryptoCertificate;
			}
			PublishStatus("Step: " + queryHistory.Queries.Count + " - ERROR (fetch failed)");
			logger.Error("Did not receive response to crypto request");
			return null;
		}

		/// <summary>
		///  We make this function static to ensure that it does not reference data from the
		///  class, which -could- be overwritten by a new incoming tx
		/// </summary>
		/// <param name="tapResponse"></param>
		/// <param name="ticksAtCompletion"></param>
		private static void ValidateTx(SignedMessage tapResponse, double fiatRequested, long ticksAtCompletion, Stopwatch stopwatch)
		{
			// Now check that the whatsit all went swimmingly.
			if (tapResponse == null)
			{
				//Events.EventSystem.Publish(new Events.TxStatus("Premature Exit at " + stopwatch.ElapsedMilliseconds));
				logger.Debug("Premature Exit at " + stopwatch.ElapsedMilliseconds);
				return;
			}

			var sinceComplete = (stopwatch.ElapsedTicks - ticksAtCompletion) / (Stopwatch.Frequency / 1000.0);
			logger.Info("Validating: sinceComplete: {0}ms, total {1}ms", sinceComplete, stopwatch.ElapsedMilliseconds);

			if (sinceComplete >= 0)
			{
				// Check that our disconnection was as expected.
				Events.EventSystem.Publish(new Events.TxStatus(tapResponse, fiatRequested));
			}
		}

		private void CachePDOLData(byte[] commandApdu)
		{
			// Assuming this is a 
			var gpoLen = commandApdu[4];
			GpoData = commandApdu.Skip(5).Take(gpoLen).ToArray();

			// Extract the amount being requested from this PDOL
			if (PDOL.ParseIntoGpoPDOL(GpoData, GpoPDOL))
			{
				FiatRequested = PDOL.GetAmount(GpoPDOL) / 100.0f;
			}
		}

		// We assume files are always 
		public void ResetTransaction()
		{
			FiatRequested = -1;
			Cache.ResetTx();
			queryHistory = new QueryWithHistory(new byte[0], new List<byte[]>(), new List<byte[]>());
			cachedTapResponse = null;
			ticksAtCompletion = 0;
		}
	}
}
