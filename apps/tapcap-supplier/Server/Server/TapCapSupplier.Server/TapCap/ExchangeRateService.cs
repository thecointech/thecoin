using Microsoft.Extensions.Hosting;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ThePricing.Api;
using ThePricing.Model;

namespace TapCapSupplier.Server.TapCap
{
	/// <summary>
	/// Gets and caches the current exchange rates.
	/// </summary>
	public class ExchangeRateService : IHostedService, IDisposable
	{
		FXRate FxRate;
		FXRate PrevFxRate;
		FXRate NextFxRate;
		object __fxLock = new object();

		private Logger logger = LogManager.GetCurrentClassLogger();

		IRatesApi RatesApi;

		ExchangeRateService(IRatesApi rateApi)
		{
			RatesApi = rateApi;
			var now = TheUtils.TheCoinTime.Now();
		}

		/// <summary>
		/// Get FX rate for the passed timestamp
		/// </summary>
		/// <param name="now"></param>
		/// <returns></returns>
		public FXRate GetCurrentFxRate(long now)
		{
			if (FxRate == null || FxRate.ValidTill.Value < now)
			{
				// The ensure should never actually block, as the system
				// should keep NextCoinRate fresh for us.
				if (EnsureNextRate(now) && NextFxRate.ValidTill.Value > now)
				{
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

		bool EnsureNextRate(long timestamp)
		{
			if (NextFxRate == null || NextFxRate.ValidTill.Value <= timestamp)
			{
				lock (__fxLock)
				{
					// Double check in case rate was updated while acquiring lock
					if (NextFxRate == null || NextFxRate.ValidTill.Value < timestamp)
					{
						logger.Trace("Updating FxRate at: {0}", timestamp);
						// Sync fetch because cannot do async inside lock
						NextFxRate = RatesApi.GetConversion(127, timestamp);
						if (NextFxRate == null || NextFxRate.ValidTill == null)
						{
							logger.Error("Could not fetch next FX rate");
							return false;
						}
						logger.Trace("New Rate Exp at: {0}", NextFxRate.ValidTill);
					}
				}
			}
			return true;
		}

		CancellationToken __cancel;
		private Timer _timer;

		Task IHostedService.StartAsync(CancellationToken cancellationToken)
		{
			__cancel = cancellationToken;
			// Create a timer, set to go off immediately
			_timer = new Timer(EnsureRates, null, TimeSpan.Zero, TimeSpan.Zero);

			return Task.CompletedTask;
		}

		Task IHostedService.StopAsync(CancellationToken cancellationToken)
		{
			throw new NotImplementedException();
		}

		private void ScheduleNextUpdate()
		{
			var now = TheUtils.TheCoinTime.Now();
			var currentExpTime = NextFxRate.ValidTill;
			var msTillExp = currentExpTime.Value - now;
			// Shift our update back 10 seconds before exp, so that
			// we are updating -before- the current rate expires
			msTillExp = Math.Max(1, msTillExp - 10000);

			if (!__cancel.IsCancellationRequested)
				_timer.Change(TimeSpan.FromMilliseconds(msTillExp), TimeSpan.Zero);
		}

		private void EnsureRates(object state)
		{
			var expTime = NextFxRate?.ValidTill.Value ?? 0;
			expTime = Math.Max(expTime, TheUtils.TheCoinTime.Now());
			EnsureNextRate(expTime);
			ScheduleNextUpdate();
		}

		void IDisposable.Dispose()
		{
			_timer?.Dispose();
		}
	}
}
