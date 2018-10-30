using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using TapCapSupplier.Server.Models;
using TheUtils;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Implements interface to talk to a local card
	/// </summary>
	public class EmvCard : IEmvCard, IDisposable
	{
		private readonly ILogger _logger;

		// Only one tx may occur at a time
		private static object __CardLock = new object();
		private EmvCardMessager card;
		internal StaticResponseCache Cache;


		public StaticResponses StaticResponses => Cache.CardStaticResponses();
		public byte[] GpoPDOL => StaticResponses.GpoPdol;
		public byte[] CryptoPDOL => StaticResponses.CryptoPdol;
		public string Name => "TODO";

		/// <summary>
		/// Implementation to handle talking directly to local payment card
		/// </summary>
		public EmvCard(ILogger<EmvCard> logger)
		{
			_logger = logger;
			lock (__CardLock)
			{
				card = new EmvCardMessager(_logger);
				Cache = new StaticResponseCache();
				//QueryStaticResponses();
			}
		}

		byte[] IEmvCard.GetSingleResponse(List<StaticResponse> staticResponse)
		{
			Cache.ResetTx();
			byte[] cardResponse = null;
			for (int i = 0; i < staticResponse.Count; i++)
			{
				var pair = staticResponse[i];
				// Get both cached response and live (from card) response
				var cacheResponse = Cache.GetResponse(pair.Query);
				cardResponse = card.SendCommand(pair.Query);

				if (cacheResponse == null)
				{
					// This is a novel message, cache the result
					Cache.AddNewStaticResponse(pair.Query, cardResponse);
				}

				// The client may not have a response if that message is non-cacheable
				if (pair.Response != null)
				{
					// Ensure that response matches what our card would generate
					if (!cardResponse.SequenceEqual(cacheResponse))
					{
						_logger.LogError("Mismatched response from cache/card: \n{0}\n{1}", BitConverter.ToString(cacheResponse), BitConverter.ToString(cardResponse));
						throw new Exception("Aaarrrghghg");
					}

					// Also check that the response matches what the client expected
					var expectedResponse = pair.Response;
					if (!expectedResponse.SequenceEqual(cacheResponse))
					{
						_logger.LogError("Cached response did not match local/client: \n{0}\n{1}", BitConverter.ToString(cacheResponse), BitConverter.ToString(expectedResponse));
						throw new Exception("Aaarrrghghg");
					}
				}
			}

			// TODO: Filter requests we don't permit
			return cardResponse;
		}


		/// <summary>
		/// 
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		byte[] IEmvCard.GenerateCrypto(TapCapClientRequest request)
		{
			lock(__CardLock)
			{
				var appData = DoStaticInit();

				var gpoQuery = Processing.BuildGPOQuery(card, request.GpoData);
				// Set GPO data (response is ignored)
				var gpoData = card.SendCommand(gpoQuery);

				//var fileList = Processing.ParseAddresses(gpoData);
				//foreach (var file in fileList)
				//{
				//	for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
				//	{
				//		var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, card);
				//		var recordData = card.SendCommand(recordQuery, "Query Record: " + recordNum);
				//	}
				//}

				// Generate crypto
				var cryptoQuery = Processing.BuildCryptSigQuery(card, request.CryptoData);
				var cryptoSig = card.SendCommand(cryptoQuery);
				return cryptoSig;
			}
		}

		///

		private void QueryStaticResponses()
		{
			Cache.ResetTx();

			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = QueryAndStore(cmdInitialize);

			var selectApp = Processing.BuildSelectApp(fileData, card);
			var appData = QueryAndStore(selectApp);

			var dummyData = PDOL.GenerateDummyData(GpoPDOL);
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
		private byte[] DoStaticInit()
		{
			_logger.LogDebug("Static Init: Tx");
			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = card.SendCommand(cmdInitialize);
			var selectApp = Processing.BuildSelectApp(fileData, card);
			return card.SendCommand(selectApp);
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
