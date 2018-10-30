using Microsoft.Extensions.Logging;

using System;
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
			IEmvCard card = new EmvCard(logger);

			var responses = card.StaticResponses;
			Assert.True(responses.GpoPdol.Length > 0, "Did not generate Gpo");
			Assert.True(responses.CryptoPdol.Length > 0, "Did not generate Crypto");
			Assert.True(responses.Responses.Count > 3, "Did not store sufficient responses");

			//var cmdInitialize = Processing.BuildInitialize(messager);
			//var fileData = (cmdInitialize);

			//var selectApp = Processing.BuildSelectApp(fileData, messager);
			//var appData = QueryAndStore(selectApp);

			//var dummyData = PDOL.GenerateDummyData(GpoPDOL);
			//var gpoQuery = Processing.BuildGPOQuery(messager,dummyData);
			//var gpoData = QueryAndStore(gpoQuery);

			//var fileList = Processing.ParseAddresses(gpoData);
			//foreach (var file in fileList)
			//{
			//	for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
			//	{
			//		var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, messager);
			//		var recordData = QueryAndStore(recordQuery);
			//	}
			//}
		}

		//[Fact]
		//public void TestCard()
		//{
		//	var messenger = new EmvCardMessager(logger);
		//	Testing.SendTestTransaction(TestPurchaseAmt, messenger);
		//}

		[Fact]
		public void TestGenCrypto()
		{
			IEmvCard card = new EmvCard(logger);

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

			var response = card.GenerateCrypto(request);

			Assert.True(response != null && response.Length > 10, "Failed to generate purchase certificate");
		}
	}
}
