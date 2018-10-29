using Prism.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace TheApp.Events
{
	public class TxStatus : EventBase
	{
		public TapCapSupplier.Client.Model.SignedMessage SignedResponse;
		public int Step;

		public TxStatus() { }
		public TxStatus(int step) { Step = step; }
		public TxStatus(TapCapSupplier.Client.Model.SignedMessage message) { SignedResponse = message; }
	}
}
