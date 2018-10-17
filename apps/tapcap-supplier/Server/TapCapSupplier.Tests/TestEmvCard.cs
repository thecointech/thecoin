using NLog;
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
		private readonly ITestOutputHelper _output;

		public TestEmvCard(ITestOutputHelper output)
		{
			_output = output;
			//XUnitTarget.RegisterOutput(output);
			//_logCapture = LoggingHelper.Capture(outputHelper);
		}

		[Fact]
		public void TestStatic()
		{
			//var logger
			var logger = (Microsoft.Extensions.Logging.ILogger < EmvCard >)Logging.XUnitLogger(_output);
			EmvCard card = new EmvCard(logger);

			var responses = card.CardStaticResponses();
			Assert.True(responses.GpoPdol.Length > 0, "Did not generate Gpo");
			Assert.True(responses.CryptoPdol.Length > 0, "Did not generate Crypto");
			Assert.True(responses.Responses.Count > 3, "Did not store sufficient responses");
		}

		[Fact]
		public void TestGenCrypto()
		{
			var logger = (Microsoft.Extensions.Logging.ILogger<EmvCard>)Logging.XUnitLogger(_output);
			EmvCard card = new EmvCard(logger);

			var responses = card.CardStaticResponses();
			var gpoData = responses.GpoPdol;
			var cryptData = responses.CryptoPdol;

			const int TestPurchaseAmt = 1000;
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
				CryptoData = PDOL.GenerateCDOL(gpoParsed),
			};

			var response = card.GenerateCrypto(request);

			//TheUtils.Testing.SendTestTransaction(10, card);


			//Assert.True(response.Length > 3, "Did not generate crypto");
		}
	}
}
