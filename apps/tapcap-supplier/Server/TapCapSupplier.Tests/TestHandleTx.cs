using System;
using System.Collections.Generic;
using System.Text;
using TapCapSupplier.Server.TapCap;
using Xunit.Abstractions;

namespace TapCapSupplier.Tests
{
	class TestHandleTx
	{
		private readonly XunitLogger<HandleTx> logger;

		public TestHandleTx(ITestOutputHelper output)
		{
			logger = new XunitLogger<HandleTx>(output);
		}
	}
}
