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
			EmvCard card = new EmvCard(logger);

			var responses = card.CardStaticResponses();
			Assert.True(responses.GpoPdol.Length > 0, "Did not generate Gpo");
			Assert.True(responses.CryptoPdol.Length > 0, "Did not generate Crypto");
			Assert.True(responses.Responses.Count > 3, "Did not store sufficient responses");
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
			EmvCard card = new EmvCard(logger);

			var responses = card.CardStaticResponses();
			var gpoData = responses.GpoPdol;
			var cryptData = responses.CryptoPdol;

			// Normally this would get sent back to the client to be filled by the terminal
			var gpoParsed = PDOL.ParsePDOLItems(gpoData);
			PDOL.FillWithDummyData(gpoParsed, TestPurchaseAmt);

			var cryptParsed = PDOL.ParsePDOLItems(cryptData);
			PDOL.FillWithDummyData(cryptParsed, TestPurchaseAmt);

			TapCapClientRequest request = new TapCapClientRequest()
			{
				CurrencyCode = 127,
				FiatAmount = TestPurchaseAmt,
				Timestamp = 0,
				GpoData = PDOL.GeneratePDOL(gpoParsed),
				CryptoData = PDOL.GenerateCDOL(cryptParsed),
			};

			var response = card.GenerateCrypto(request);

			Assert.True(response != null && response.Length > 10, "Failed to generate purchase certificate");

			//TheUtils.Testing.SendTestTransaction(10, card);


			//Assert.True(response.Length > 3, "Did not generate crypto");
		}
	}
}
