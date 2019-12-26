using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Card;
using TapCapSupplier.Server.Models;
using TheUtils;
using Xunit;
using Xunit.Abstractions;

namespace TapCapSupplier.Tests
{
	public class TestEmvCard
	{
		private readonly XunitLogger<EmvCard> logger;
		const int TestPurchaseAmt = 1347;

		public TestEmvCard(ITestOutputHelper output)
		{
			logger = new XunitLogger<EmvCard>(output);
		}

		[Fact]
		public void TestStatic()
		{
			IEmvCard card = new EmvCard(logger, null); // TODO

			var responses = card.StaticResponses;
			Assert.True(responses.GpoPdol.Length > 0, "Did not generate Gpo");
			Assert.True(responses.CryptoPdol.Length > 0, "Did not generate Crypto");
			Assert.True(responses.Responses.Count > 3, "Did not store sufficient responses");

		}




		[Fact]
		public void TestCacheTrimming()
		{
			StaticResponseCache cache = new StaticResponseCache();

			var query1 = ByteConvert.FromString("00-A4-04-00-07-A0-00-00-02-77-10-10");
			var query2 = ByteConvert.FromString("00-A4-04-00-07-A0-00-00-02-77-10-10-00");
			var response = ByteConvert.FromString("6F-36-84-07-A0-00-00-02-77-10-10-A5-2B-50-07-49-6E-74-65-72-61-63-87-01-01-5F-2D-04-65-6E-66-72-9F-38-15-9F-59-03-9F-5A-01-9F-02-06-9F-1A-02-5F-2A-02-9F-37-04-9F-58-01-90-00");

			var asStr = System.Text.Encoding.UTF8.GetString(response, 0, response.Length);

			int idx1 = cache.AddNewStaticResponse(query1, response);
			cache.ResetTx();
			int idx2 = cache.AddNewStaticResponse(query2, response);

			Assert.Equal(idx1, idx2);

			var resp1 = cache.GetResponse(query1);
			cache.ResetTx();
			var resp2 = cache.GetResponse(query2);
			Assert.Equal(resp1, resp2);
		}

		private void RunTestTx(IEmvCard card, int maxCount)
		{
			var messenger = new EmvCardMessager(logger);
			QueryWithHistory query = new QueryWithHistory()
			{
				Responses = new List<byte[]>(),
				Queries = new List<byte[]>()
			};
			var sresp = card.StaticResponses.Responses;
			var sqery = card.StaticResponses.Queries;
			var spars = card.StaticResponses.ResponseParentIndex;
			var counter = sresp.Count;

			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");

			var cmdInitialize = Processing.BuildInitialize(messenger);
			query.Query = cmdInitialize.ToArray();
			var fileData = card.GetSingleResponse(query);

			counter = Math.Min(maxCount, counter + 1);
			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");

			query.Queries.Add(query.Query);
			query.Responses.Add(fileData);
			query.Query = Processing.BuildSelectApp(fileData, messenger).ToArray();
			var appData = card.GetSingleResponse(query);

			counter = Math.Min(maxCount, counter + 1);
			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");

			var GpoPDOL = card.GpoPDOL;
			Assert.True(card.GpoPDOL != null, "Should have read and cached GpoPDOL");
			var dummyData = PDOL.GenerateDummyData(GpoPDOL);

			query.Queries.Add(query.Query);
			query.Responses.Add(appData);
			query.Query = Processing.BuildGPOQuery(messenger, dummyData).ToArray();

			var gpoData = card.GetSingleResponse(query);

			counter = Math.Min(maxCount, counter + 1);
			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");

			query.Queries.Add(query.Query);
			query.Responses.Add(gpoData);


			var fileList = Processing.ParseAddresses(gpoData);
			foreach (var file in fileList)
			{
				for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
				{
					query.Query = Processing.BuildReadRecordApdu(file, recordNum, messenger).ToArray();
					var recordData = card.GetSingleResponse(query);

					query.Queries.Add(query.Query);
					query.Responses.Add(recordData);

					counter = Math.Min(maxCount, counter + 1);
					Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");
				}
			}

			Assert.True(card.CryptoPDOL != null, "Should have read and cached CryptoPDOL");
			var cdolParsed = PDOL.ParsePDOLItems(card.CryptoPDOL);

			PDOL.FillWithDummyData(cdolParsed);

			query.Query = Processing.BuildCryptSigQuery(messenger, PDOL.GenerateCDOL(cdolParsed)).ToArray();
			var fuckinAye = card.GetSingleResponse(query);

			// array sizes should not have increased!
			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");
			Assert.True(fuckinAye != null, "Built Crypto from single message successfully");
		}

		//[Fact]
		//public void TestGetSingle()
		//{
		//	IEmvCard card = new EmvCard(logger, null);

		//	Assert.True(card.GpoPDOL == null, "Should start with empty history");
		//	Assert.True(card.CryptoPDOL == null, "Should start with empty history");

		//	RunTestTx(card, 100000);

		//	int currentCount = card.StaticResponses.Responses.Count;

		//	RunTestTx(card, currentCount);
		//}

		[Fact]
		public void TestSaveLoad()
		{
			Microsoft.AspNetCore.Hosting.IHostingEnvironment mockHost = new MockHosting();

			IEmvCard card = new EmvCard(logger, null);
			string cacheFilePath = String.Format("{0}\\cache\\{1}.json", mockHost.ContentRootPath, card.Name);
			File.Delete(cacheFilePath);

			// Reset card
			card = new EmvCard(logger, mockHost);
			RunTestTx(card, 100000);

			int counter = card.StaticResponses.Responses.Count;

			Assert.True(File.Exists(cacheFilePath), "Did not create new file");

			card = new EmvCard(logger, mockHost);

			var sresp = card.StaticResponses.Responses;
			var sqery = card.StaticResponses.Queries;
			var spars = card.StaticResponses.ResponseParentIndex;
			Assert.True(sresp.Count == counter && sqery.Count == counter && spars.Count == counter, "Mismatched array sizes");

			RunTestTx(card, counter);
		}

		[Fact]
		public void TestGenCrypto()
		{
			IEmvCard card = new EmvCard(logger, null);

			var responses = card.StaticResponses;
			var gpoData = responses.GpoPdol;
			var cryptData = responses.CryptoPdol;


			//Assert.True(card.GpoPDOL == null, "Should start with empty history");
			//Assert.True(card.CryptoPDOL == null, "Should start with empty history");
			// Normally this would get sent back to the client to be filled by the terminal
			var gpoParsed = PDOL.ParsePDOLItems(gpoData);
			PDOL.FillWithDummyData(gpoParsed, TestPurchaseAmt);

			var cryptParsed = PDOL.ParsePDOLItems(cryptData);
			PDOL.FillWithDummyData(cryptParsed, TestPurchaseAmt);

			TapCapClientRequest request = new TapCapClientRequest()
			{
				Timestamp = 0,
				GpoData = PDOL.GeneratePDOL(gpoParsed),
				CryptoData = PDOL.GenerateCDOL(cryptParsed),
			};

			var response = card.GenerateCrypto(request);

			Assert.True(response != null && response.Length > 10, "Failed to generate purchase certificate");
		}

		[Fact]
		public void TestMultipleSimultaneous()
		{
			IEmvCard card = new EmvCard(logger, null); // TODO

			var responses = card.StaticResponses;
			var gpoData = responses.GpoPdol;
			var cryptData = responses.CryptoPdol;


			// Normally this would get sent back to the client to be filled by the terminal
			var gpoParsed = PDOL.ParsePDOLItems(gpoData);
			PDOL.FillWithDummyData(gpoParsed, TestPurchaseAmt);

			var cryptParsed = PDOL.ParsePDOLItems(cryptData);
			PDOL.FillWithDummyData(cryptParsed, TestPurchaseAmt);

			TapCapClientRequest request = new TapCapClientRequest()
			{
				Timestamp = 0,
				GpoData = PDOL.GeneratePDOL(gpoParsed),
				CryptoData = PDOL.GenerateCDOL(cryptParsed),
			};

			const int numSimultaneous = 20;
			Task[] tasks = new Task[numSimultaneous];
			bool[] success = new bool[numSimultaneous];
			for (int i = 0; i < numSimultaneous; i++)
			{
				var taskIdx = i;
				tasks[taskIdx] = Task.Run(() =>
				{
					logger.Log(LogLevel.Information, "Beginning item {0}", taskIdx);
					var response = card.GenerateCrypto(request);
					logger.Log(LogLevel.Information, "Gen success {0}, {1}", taskIdx, response != null);
					success[taskIdx] = response != null;
				});
			}

			Task.WaitAll(tasks);
			var numFailed = success.Where(v => !v).Count();
			Assert.True(numFailed == 0, "Failed to generate " + numFailed + " purchase certificate(s)");

		}
	}
}
