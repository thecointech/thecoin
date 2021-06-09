using Microsoft.Extensions.Hosting;
using NLog;
using System;
using System.Threading;
using System.Threading.Tasks;
using ThePricing.Api;
using ThePricing.Model;
using TheUtils;

namespace TapCapSupplier.TapCap
{
	/// <summary>
	/// Gets and caches the current exchange rates.
	/// </summary>
	public class ExchangeRateService
	{
		FXRate FxRate;
		internal FXRate PrevFxRate { get; private set; }
		internal FXRate NextFxRate { get; private set; }
		object __fxLock = new();

		private Logger logger = LogManager.GetCurrentClassLogger();
		private readonly IRatesApi RatesApi = new RatesApi(Environment.GetEnvironmentVariable("URL_SERVICE_RATES"));

		/// <summary>
		/// 
		/// </summary>
		/// <param name="logger"></param>
		/// <param name="rateApi"></param>
		public ExchangeRateService()
		{
			var now = TheCoinTime.Now();
			GetCurrentFxRate(now);
		}

		/// <summary>
		/// Get FX rate for the passed timestamp
		/// </summary>
		/// <param name="now"></param>
		/// <returns></returns>
		public FXRate GetCurrentFxRate(long now)
		{
			if (FxRate == null || FxRate.ValidTill <= now)
			{
				// The ensure should never actually block, as the system
				// should keep NextCoinRate fresh for us.
				if (EnsureNextRate(now) && NextFxRate.ValidTill > now)
				{
					logger.Trace("Updating Current at: {0} - from {1} to {2}",
						TheCoinTime.ToLocal(now),
						TheCoinTime.ToLocal(NextFxRate.ValidFrom).ToString("HH:MM"),
						TheCoinTime.ToLocal(NextFxRate.ValidTill).ToString("HH:MM"));
					PrevFxRate = FxRate;
					FxRate = NextFxRate;
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
			if (NextFxRate == null || NextFxRate.ValidTill <= timestamp)
			{
				lock (__fxLock)
				{
					// Double check in case rate was updated while acquiring lock
					if (NextFxRate == null || NextFxRate.ValidTill <= timestamp)
					{
						logger.Trace("Fetching rate for: {0}", TheCoinTime.ToLocal(timestamp));
						// Sync fetch because cannot do async inside lock
						NextFxRate = RatesApi.GetSingle(timestamp);
						if (NextFxRate == null)
						{
							logger.Error("Could not fetch next FX rate");
							return false;
						}
						logger.Trace("Fetched rate valid until: {0}", TheCoinTime.ToLocal(NextFxRate.ValidTill));
					}
				}
			}
			return true;
		}

	}

	/// <summary>
	/// Background service to trigger updates on ExchangeRateService
	/// </summary>
	public class ExchangeRateUpdateService : IHostedService, IDisposable
	{
		CancellationToken __cancel;
		private Timer _timer;
		ExchangeRateService cache;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="fxRateService"></param>
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
			_timer?.Dispose();
			return Task.CompletedTask;
		}

		private void ScheduleNextUpdate()
		{
			var now = TheCoinTime.Now();
			var currentExpTime = cache.NextFxRate.ValidFrom + (3 * 60 * 60 * 1000);
			var msTillExp = currentExpTime - now;
			// Shift our update back 10 seconds before exp, so that
			// we are updating -before- the current rate expires
			// However, don't update too quickly
			msTillExp = Math.Max(1000, msTillExp - 10000);

			if (!__cancel.IsCancellationRequested)
				_timer.Change(TimeSpan.FromMilliseconds(msTillExp), TimeSpan.Zero);
		}

		private void EnsureRates(object state)
		{
			long expTime = (long)cache.NextFxRate?.ValidTill;
			expTime = Math.Max(expTime, TheCoinTime.Now());
			cache.EnsureNextRate(expTime);
			ScheduleNextUpdate();
		}

		void IDisposable.Dispose()
		{
			_timer?.Dispose();
		}
	}
}
