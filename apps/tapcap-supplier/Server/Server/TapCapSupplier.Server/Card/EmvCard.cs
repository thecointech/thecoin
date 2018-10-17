using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using TapCapSupplier.Server.Models;
using TheUtils;
using Microsoft.Extensions.Logging;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Implements interface to talk to a local card
	/// </summary>
	public class EmvCard : IEmvCard, IDisposable
	{
		private readonly ILogger _logger;

		/// <summary>
		/// Implementation to handle talking directly to local payment card
		/// </summary>
		public EmvCard(ILogger<EmvCard> logger)
		{
			_logger = logger;
			lock (__CardLock)
			{
				card = new EmvCardMessager(_logger);
				QueryStaticResponses();
			}
		}

		/// <summary>
		/// 
		/// </summary>
		/// <returns></returns>
		public StaticResponses CardStaticResponses()
		{
			return staticResponses;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		public byte[] GenerateCrypto(TapCapClientRequest request)
		{
			lock(__CardLock)
			{
				var appData = DoStaticInit();

				var gpoQuery = Processing.BuildGPOQuery(card, request.GpoData);
				// Set GPO data (response is ignored)
				var gpoData = card.SendCommand(gpoQuery, "Set Gpo");

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
				var cryptoSig = card.SendCommand(cryptoQuery, "Gen CryptoSig");
				return cryptoSig?.GetData();
			}
		}

		///

		private void QueryStaticResponses()
		{
			staticResponses = new StaticResponses()
			{
				Responses = new List<StaticResponse>()
			};

			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = QueryAndStore(cmdInitialize, "Select File");

			var selectApp = Processing.BuildSelectApp(fileData, card);
			var appData = QueryAndStore(selectApp, "Select App");

			staticResponses.GpoPdol = Processing.FindValue(appData.GetData(), new string[] { "6F", "A5", "9F38" });
			var dummyData = PDOL.GenerateDummyData(staticResponses.GpoPdol);
			var gpoQuery = Processing.BuildGPOQuery(card, dummyData);
			var gpoData = QueryAndStore(gpoQuery, "Query GPO");

			var fileList = Processing.ParseAddresses(gpoData);
			foreach (var file in fileList)
			{
				for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
				{
					var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, card);
					var recordData = QueryAndStore(recordQuery, "Query Record: " + recordNum);

					if (staticResponses.CryptoPdol == null)
						staticResponses.CryptoPdol = Processing.FindValue(recordData.GetData(), new string[] { "70", "8C" });
				}
			}
		}

		private Response QueryAndStore(CommandApdu query, string name)
		{
			Response queryResponse = card.SendCommand(query, name);
			byte[] data = queryResponse.GetData();

			staticResponses.Responses.Add(new StaticResponse()
			{
				Query = query.Data,
				Response = data
			});
			return queryResponse;
		}

		// Return the command we warmed up to
		private Response DoStaticInit()
		{
			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = card.SendCommand(cmdInitialize, "Init Tx");
			var selectApp = Processing.BuildSelectApp(fileData, card);
			return card.SendCommand(selectApp, "Select App");
		}


		/// <summary>
		/// 
		/// </summary>
		public void Dispose()
		{
			card.Dispose();
		}

		//////////////////////////////////////////////////////////

		// Only one tx may occur at a time
		private static object __CardLock = new object();

		private EmvCardMessager card;
		private StaticResponses staticResponses;
	}
}
