using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using ThePricing.Api;
using ThePricing.Model;
using TheUtils;


namespace TapCapSupplier.Server.TapCap
{
	/// <summary>
	/// Gets and caches the current exchange rates.
	/// </summary>
	public class ExchangeRateService
	{
		FXRate FxRate;
		internal FXRate PrevFxRate { get; private set; }
		internal FXRate NextFxRate { get; private set; }
		object __fxLock = new object();

		private readonly ILogger _logger;

		IRatesApi RatesApi;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="logger"></param>
		/// <param name="rateApi"></param>
		public ExchangeRateService(ILogger<ExchangeRateService> logger, IRatesApi rateApi)
		{
			_logger = logger;
			RatesApi = rateApi;
			var now = TheCoinTime.Now();
		}

		/// <summary>
		/// Get FX rate for the passed timestamp
		/// </summary>
		/// <param name="now"></param>
		/// <returns></returns>
		public FXRate GetCurrentFxRate(long now)
		{
			if (FxRate == null || FxRate.ValidTill.Value <= now)
			{
				using (_logger.BeginScope("Updating Current"))
				{
					// The ensure should never actually block, as the system
					// should keep NextCoinRate fresh for us.
					if (EnsureNextRate(now) && NextFxRate.ValidTill.Value > now)
					{
						_logger.LogTrace("Updating Current at: {0} - from {1} to {2}",
							TheCoinTime.ToLocal(now),
							TheCoinTime.ToLocal(NextFxRate.ValidFrom.Value).ToString("HH:MM"),
							TheCoinTime.ToLocal(NextFxRate.ValidTill.Value).ToString("HH:MM"));
						PrevFxRate = FxRate;
						FxRate = NextFxRate;
					}
				}
			}
			return FxRate;
		}

		//public FXRate GetCurrentFXRate(long now)
		//{
		//	if (FiatRate == null || FiatRate.ValidTill.Value < now)
		//	{
		//		// The ensure should never actually block, as the system
		//		// should keep NextFiatRate fresh for us.
		//		EnsureNextRate(now, 0, __coinLock, ref NextFiatRate);
		//		FiatRate = NextFiatRate;
		//	}
		//	return FiatRate;
		//}

		internal bool EnsureNextRate(long timestamp)
		{
			if (NextFxRate == null || NextFxRate.ValidTill.Value <= timestamp)
			{
				lock (__fxLock)
				{
					// Double check in case rate was updated while acquiring lock
					if (NextFxRate == null || NextFxRate.ValidTill.Value <= timestamp)
					{
						_logger.LogTrace("Fetching rate for: {0}", TheCoinTime.ToLocal(timestamp));
						// Sync fetch because cannot do async inside lock
						NextFxRate = RatesApi.GetConversion(124, timestamp);
						if (NextFxRate == null || NextFxRate.ValidTill == null)
						{
							_logger.LogError("Could not fetch next FX rate");
							return false;
						}
						_logger.LogTrace("Fetched rate valid until: {0}", TheCoinTime.ToLocal(NextFxRate.ValidTill.Value));
					}
				}
			}
			return true;
		}

	}

	/// <summary>
	/// Ervice taht 
	/// </summary>
	public class ExchangeRateUpdateService : IHostedService, IDisposable
	{
		CancellationToken __cancel;
		private Timer _timer;
		ExchangeRateService cache;

		public ExchangeRateUpdateService(ExchangeRateService fxRateService)
		{
			cache = fxRateService;
		}

		Task IHostedService.StartAsync(CancellationToken cancellationToken)
		{
			__cancel = cancellationToken;
			// Create a timer, set to go off immediately
			_timer = new Timer(EnsureRates, null, TimeSpan.Zero, TimeSpan.Zero);

			return Task.CompletedTask;
		}

		Task IHostedService.StopAsync(CancellationToken cancellationToken)
		{
			// TODO:
			throw new NotImplementedException();
		}

		private void ScheduleNextUpdate()
		{
			var now = TheUtils.TheCoinTime.Now();
			var currentExpTime = cache.NextFxRate.ValidTill;
			var msTillExp = currentExpTime.Value - now;
			// Shift our update back 10 seconds before exp, so that
			// we are updating -before- the current rate expires
			msTillExp = Math.Max(1, msTillExp - 10000);

			if (!__cancel.IsCancellationRequested)
				_timer.Change(TimeSpan.FromMilliseconds(msTillExp), TimeSpan.Zero);
		}

		private void EnsureRates(object state)
		{
			var expTime = cache.NextFxRate?.ValidTill.Value ?? 0;
			expTime = Math.Max(expTime, TheUtils.TheCoinTime.Now());
			cache.EnsureNextRate(expTime);
			ScheduleNextUpdate();
		}

		void IDisposable.Dispose()
		{
			_timer?.Dispose();
		}
	}
}
