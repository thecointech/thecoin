using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Writers;
using NLog.Web;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace TapCapSupplier
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
			try
			{
				SetEnv.Load();
				logger.Debug("Application Starting Up");
				var host = CreateHost(args);
				if (ShouldGenerateSwagger(args))
				{
					var outFile = args[1];
					GenerateSwagger(host, "v1", outFile);
					logger.Info($"Wrote swagger to {outFile}");
				}
				else
					host.Run();
			}
			catch (Exception exception)
			{
				logger.Error(exception, "Stopped program because of exception");
				throw;
			}
			finally
			{
				NLog.LogManager.Shutdown();
			}
		}

		public static IHost CreateHost(string[] args) =>
			Host.CreateDefaultBuilder(args)
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder.ConfigureKestrel(options =>
					{
						var port = Environment.GetEnvironmentVariable("PORT_SERVICE_TAPCAP");
						// listen to requests from outside the local machine
						options.Listen(System.Net.IPAddress.Any, Int32.Parse(port));
					});
					webBuilder.UseStartup<Startup>();
				})
				.ConfigureLogging(logging =>
				{
					logging.ClearProviders();
					logging.SetMinimumLevel(LogLevel.Information);
				})
				.UseNLog()
				.Build();

		private static bool ShouldGenerateSwagger(string[] args) => args.Length > 0 && args[0] == "--swagger";
		private static void GenerateSwagger(IHost host, string docName, string outFile)
		{
			var sw = (ISwaggerProvider)host.Services.GetService(typeof(ISwaggerProvider));
			var doc = sw.GetSwagger(docName, null);
			using (var streamWriter = new StringWriter())
			{
				var writer = new OpenApiJsonWriter(streamWriter);
				doc.SerializeAsV3(writer);

				// write to file
				FileInfo file = new FileInfo(outFile);
				file.Directory.Create(); // If the directory already exists, this method does nothing.
				File.WriteAllText(file.FullName, streamWriter.ToString());
			}
		}
	}
}
