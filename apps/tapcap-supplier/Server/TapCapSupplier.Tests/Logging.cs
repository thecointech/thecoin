using System;
using System.IO;
using Xunit.Abstractions;
using Microsoft.Extensions.Logging;

namespace TapCapSupplier.Tests
{
	public class XunitLogger<T> : ILogger<T>, IDisposable
	{
		private ITestOutputHelper _output;

		public XunitLogger(ITestOutputHelper output)
		{
			_output = output;
		}
		public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
		{
			_output.WriteLine(state.ToString());
		}

		public bool IsEnabled(LogLevel logLevel)
		{
			return true;
		}

		public IDisposable BeginScope<TState>(TState state)
		{
			return this;
		}

		public void Dispose()
		{
		}
	}

	//internal static class Logging
	//{

	//	public static ILogger DefaultLogger()
	//	{
	//		return NullLogger();
	//	}

	//	public static ILogger NullLogger()
	//	{
	//		return null; // Substitute.For<ILogger>();
	//	}

	//	public static ILogger XUnitLogger(ITestOutputHelper testOutputHelper, ILoggerFactory loggerFactory)
	//	{
	//		// Step 1. Create configuration object 
	//		var config = new LoggingConfiguration();

	//		// Step 2. Create targets and add them to the configuration 
	//		var consoleTarget = new XUnitTarget(testOutputHelper);
	//		config.AddTarget("xunit", consoleTarget);

	//		// Step 3. Set target properties 
	//		consoleTarget.Layout = @"${date:format=HH\:mm\:ss} ${logger} ${message}";

	//		// Step 4. Define rules
	//		var rule1 = new LoggingRule("*", LogLevel.Trace, consoleTarget);
	//		config.LoggingRules.Add(rule1);

	//		// Step 5. Activate the configuration
	//		LogManager.Configuration = config;

	//		loggerFactory.AddProvider(LogManager.LogFactory);
	//		return LogManager.GetLogger("");
	//	}
	//}

	//[Target("XUnit")]
	//public sealed class XUnitTarget : TargetWithLayout
	//{
	//	private readonly ITestOutputHelper _output;

	//	public XUnitTarget(ITestOutputHelper testOutputHelper)
	//	{
	//		_output = testOutputHelper;
	//	}

	//	protected override void Write(LogEventInfo logEvent)
	//	{
	//		string logMessage = this.Layout.Render(logEvent);

	//		_output.WriteLine(logMessage);
	//	}
	//}
}
