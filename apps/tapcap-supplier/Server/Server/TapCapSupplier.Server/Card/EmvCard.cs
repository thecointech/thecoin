using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using TapCapSupplier.Server.Models;
using TheUtils;
using Microsoft.Extensions.Logging;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using System.Threading.Tasks;
using System.Threading;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Implements interface to talk to a local card
	/// </summary>
	public class EmvCard : IEmvCard, IDisposable
	{
		private readonly ILogger _logger;

		private IEmvCard AsBase => this as IEmvCard;

		// Our card lock needs to be preserved between
		// thread switches, so we use a combo
		// counter to ensure threads are finished,
		// and lock to make queued threads wait
		private static object __CardLock = new object();
		private static int __IsReady = 0;
		private EmvCardMessager card;
		internal ServerResponseCache Cache;


		StaticResponses IEmvCard.StaticResponses => Cache.CardStaticResponses();
		byte[] IEmvCard.GpoPDOL => AsBase.StaticResponses.GpoPdol;
		byte[] IEmvCard.CryptoPDOL => AsBase.StaticResponses.CryptoPdol;
		string IEmvCard.Name => ReadCardName();

		/// <summary>
		/// Implementation to handle talking directly to local payment card
		/// </summary>
		public EmvCard(ILogger<EmvCard> logger, IHostingEnvironment appEnv)
		{
			_logger = logger;
			
			card = new EmvCardMessager(_logger);
			Cache = new ServerResponseCache(Utils.Utils.GetDataPath(appEnv), AsBase.Name);
			try
			{
				Cache.LoadStaticResponses();
			}
			catch (Exception e)
			{
				_logger.LogError("Error loading cache: {0}", e.Message);
			}

			// If no cache present, ensure we init new cache
			if (Cache.CardStaticResponses().Responses.Count == 0)
				QueryStaticResponses();

			DoStaticInit(1);
		}

		byte[] AcquireLockAndDo(Func<byte[]> func)
		{
			byte[] res = null;
			lock (__CardLock)
			{
				int wasInitialized = Interlocked.CompareExchange(ref __IsReady, 0, 1);
				if (wasInitialized == 0)
					DoStaticInit(wasInitialized);

				res = func();

				// We do a single fall-back on failure
				if (res == null)
				{
					_logger.LogInformation("Last tx failed tx: attempting retry");
					DoStaticInit(wasInitialized);
					res = func();
					if (res == null)
						_logger.LogError("Regenerating failed: please check the logs");
					else
						_logger.LogInformation("Regeneration successful, be on your way good sirs");

					// If we have to regenerate, we make sure we do a static init after this run
					// (regardless of whether or not it is necessary)
					wasInitialized = 1;
				}
				// Set is-ready to not-ready
				//Interlocked.Exchange(ref __IsReady, 0);

				// We assume we should leave this in the same state we found it.
				if (wasInitialized != 0)
				{
					Task.Run(() => DoStaticInit(wasInitialized));
				}
			}
			return res;
		}

		byte[] IEmvCard.GetSingleResponse(QueryWithHistory queryWithHistory)
		{
			if (queryWithHistory.Responses.Count != queryWithHistory.Responses.Count)
			{
				_logger.LogError("Mismatched arrays");
				return null;
			}

			return AcquireLockAndDo(() =>
			{
				Cache.ResetTx();
				for (int i = 0; i < queryWithHistory.Queries.Count; i++)
				{
					var query = queryWithHistory.Queries[i];
					var clientResponse = queryWithHistory.Responses[i];
					CheckCachedResponse(query, clientResponse);
				}

				// TODO: Filter requests we don't permit
				return CheckCachedResponse(queryWithHistory.Query, null);
			});
		}

		byte[] CheckCachedResponse(byte[] query, byte[] clientResponse)
		{
			// Get both cached response and live (from card) response
			var cacheResponse = Cache.GetResponse(query);
			var cardResponse = card.SendCommand(query);

			if (cacheResponse == null)
			{
				// This is a novel message, cache the result
				int idx = Cache.AddNewStaticResponse(query, cardResponse);
				if (idx >= 0)
				{
					var responses = Cache.CardStaticResponses();
					_logger.LogInformation("Caching: [{0}] {1} => {2}", responses.ResponseParentIndex[idx], BitConverter.ToString(responses.Queries[idx]), BitConverter.ToString(responses.Responses[idx]));
				}
			}
			else
			{
				// Ensure that response matches what our card would generate
				if (!cardResponse.SequenceEqual(cacheResponse))
				{
					_logger.LogError("Mismatched response from cache/card: \n{0}\n{1}", BitConverter.ToString(cacheResponse), BitConverter.ToString(cardResponse));
					throw new Exception("Aaarrrghghg");
				}
			}
			// The client may not have a response if that message is non-cacheable
			if (clientResponse != null)
			{
				// Also check that the response matches what the client expected
				if (!clientResponse.SequenceEqual(cacheResponse))
				{
					_logger.LogError("Cached response did not match local/client: \n{0}\n{1}", BitConverter.ToString(cacheResponse), BitConverter.ToString(clientResponse));
					throw new Exception("Aaarrrghghg");
				}
			}

			return cardResponse;
		}


		/// <summary>
		/// 
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		byte[] IEmvCard.GenerateCrypto(TapCapClientRequest request)
		{
			var gpoQuery = Processing.BuildGPOQuery(card, request.GpoData);

			return AcquireLockAndDo(() =>
			{
				// Set GPO data (response is ignored)
				var gpoData = card.SendCommand(gpoQuery);

				// Generate crypto
				var cryptoQuery = Processing.BuildCryptSigQuery(card, request.CryptoData);
				return card.SendCommand(cryptoQuery);
			});
		}

		///

		private void QueryStaticResponses()
		{
			Cache.ResetTx();

			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = QueryAndStore(cmdInitialize);

			var selectApp = Processing.BuildSelectApp(fileData, card);
			var appData = QueryAndStore(selectApp);

			var dummyData = PDOL.GenerateDummyData(AsBase.GpoPDOL);
			var gpoQuery = Processing.BuildGPOQuery(card, dummyData);
			var gpoData = QueryAndStore(gpoQuery);

			var fileList = Processing.ParseAddresses(gpoData);
			foreach (var file in fileList)
			{
				for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
				{
					var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, card);
					var recordData = QueryAndStore(recordQuery);
				}
			}
		}

		private byte[] QueryAndStore(CommandApdu query)
		{
			byte[] response = card.SendCommand(query);
			Cache.AddNewStaticResponse(query.ToArray(), response);
			return response;
		}

		// Return the command we warmed up to
		private void DoStaticInit(int saveInitStatus)
		{
			// Manually increment the lock to prevent
			// other threads from jumping in in front of
			// us in the queue
			lock(__CardLock)
			{
				try
				{
					_logger.LogDebug("Static Init: Tx");
					var cmdInitialize = Processing.BuildInitialize(card);
					var fileData = card.SendCommand(cmdInitialize);
					var selectApp = Processing.BuildSelectApp(fileData, card);
					card.SendCommand(selectApp);
					// Set is-ready to be, actually, ready.
					Interlocked.Exchange(ref __IsReady, saveInitStatus);
				}
				catch(Exception err)
				{
					_logger.LogError("Error in StaticInit: {0}", err.ToString());
				}
			}
		}


		private string ReadCardName()
		{
			lock (__CardLock)
			{
				byte[] cmd = { 0xFF, 0xCA, 0, 0, 0 };
				var response = card.SendCommand(cmd);
				// Assume it is necessary to reset the card
				Task.Run(() => DoStaticInit(1));
				return BitConverter.ToString(response);
			}
		}


		/// <summary>
		/// 
		/// </summary>
		public void Dispose()
		{
			card.Dispose();
		}
	}
}
