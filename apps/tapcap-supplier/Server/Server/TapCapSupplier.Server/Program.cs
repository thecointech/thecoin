using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore;
using System;
using NLog.Web;
using Microsoft.Extensions.Logging;

namespace TapCapSupplier.Server
{
	/// <summary>
	/// Program
	/// </summary>
	public class Program
	{
		/// <summary>
		/// Main
		/// </summary>
		/// <param name="args"></param>
		public static void Main(string[] args)
		{
			// NLog: setup the logger first to catch all errors
			var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();

			try
			{
				logger.Debug("init main");
				CreateWebHostBuilder(args).Build().Run();
			}
			catch (Exception ex)
			{
				//NLog: catch setup errors
				logger.Error(ex, "Stopped program because of exception");
				throw;
			}
			finally
			{
				// Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
				NLog.LogManager.Shutdown();
			}
		}

		/// <summary>
		/// Create the web host builder.
		/// </summary>
		/// <param name="args"></param>
		/// <returns>IWebHostBuilder</returns>
		public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
			WebHost.CreateDefaultBuilder(args)
				.UseStartup<Startup>()
				.ConfigureLogging(logging =>
				{
					logging.ClearProviders();
					logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Trace);
				})
				.UseNLog()  // NLog: setup NLog for Dependency injection
                .UseUrls("http://0.0.0.0:9361/");
	}
}
