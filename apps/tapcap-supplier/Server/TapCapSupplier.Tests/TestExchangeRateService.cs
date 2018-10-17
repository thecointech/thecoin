using Microsoft.Extensions.Logging;
using TapCapSupplier.Server.TapCap;
using TapCapSupplier.Server.Card;
using TapCapSupplier.Server.Models;
using TheUtils;
using Xunit;
using Xunit.Abstractions;
using ThePricing.Api;
using System.Threading.Tasks;
using ThePricing.Client;
using ThePricing.Model;
using System.Threading;

namespace TapCapSupplier.Tests
{
	public class TestExchangeRateService
	{
		private readonly XunitLogger<ExchangeRateService> logger;
		const int TestPurchaseAmt = 1347;

		public TestExchangeRateService(ITestOutputHelper output)
		{
			logger = new XunitLogger<ExchangeRateService>(output);
		}

		// Test the caching settings of the service.  It should only check for 
		[Fact]
		public async void TestCaching()
		{
			var rates = new MockRates();
			var service = new ExchangeRateService(logger, rates);
			Microsoft.Extensions.Hosting.IHostedService hosted = service;

			// Start caching service
			CancellationToken token = new CancellationToken();
			await hosted.StartAsync(token);

			// Ensure that the first update is complete
			await Task.Delay(100);
			Assert.True(rates.Counter == 1, "No initial update");

			// 2 minutes wait time;
			var totalWaitTime = 2 * 60 * 1000;
			for (int i = 0; i < 1000; i++)
			{
				var now = TheCoinTime.Now();
				var lastCounter = rates.Counter;
				var rate = service.GetCurrentFxRate(now);
				Assert.Equal(lastCounter, rates.Counter);
				Assert.True(rate.ValidFrom <= now, "Bad ValidFrom");
				Assert.True(rate.ValidTill > now, "Bad ValidFrom");

				await Task.Delay(totalWaitTime / 1000);
			}

			Assert.True(rates.Counter == 5, "Too many updates");
		}
	}

	class MockRates : IRatesApi
	{
		public Configuration Configuration { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
		public ExceptionFactory ExceptionFactory { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }

		public int Counter { get; private set; }

		public string GetBasePath()
		{
			throw new System.NotImplementedException();
		}

		public ThePricing.Model.FXRate GetConversion(int? currencyCode, long? timestamp)
		{
			Counter++;

			var validFrom = timestamp.Value;
			var validUntil = timestamp + 31 * 1000;
			return new ThePricing.Model.FXRate(currencyCode, 1, 2, 1, validFrom, validUntil);
		}

		public Task<ThePricing.Model.FXRate> GetConversionAsync(int? currencyCode, long? timestamp)
		{
			return Task.FromResult(GetConversion(currencyCode, timestamp));
		}

		public Task<ApiResponse<ThePricing.Model.FXRate>> GetConversionAsyncWithHttpInfo(int? currencyCode, long? timestamp)
		{
			throw new System.NotImplementedException();
		}

		public ApiResponse<ThePricing.Model.FXRate> GetConversionWithHttpInfo(int? currencyCode, long? timestamp)
		{
			throw new System.NotImplementedException();
		}
	}
}
