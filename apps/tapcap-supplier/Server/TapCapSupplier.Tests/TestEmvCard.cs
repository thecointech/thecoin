using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
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

		[Fact]
		public void TestGetSingle()
		{
			IEmvCard card = new EmvCard(logger, null);

			Assert.True(card.GpoPDOL == null, "Should start with empty history");
			Assert.True(card.CryptoPDOL == null, "Should start with empty history");

			RunTestTx(card, 100000);

			int currentCount = card.StaticResponses.Responses.Count;

			RunTestTx(card, currentCount);
		}

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


			Assert.True(card.GpoPDOL == null, "Should start with empty history");
			Assert.True(card.CryptoPDOL == null, "Should start with empty history");
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
	}
}
