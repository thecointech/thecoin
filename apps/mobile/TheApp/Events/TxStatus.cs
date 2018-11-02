using Prism.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace TheApp.Events
{
	public class TxStatus : EventBase
	{
		public TapCapSupplier.Client.Model.SignedMessage SignedResponse;
		public string Status;

		public TxStatus() { }
		public TxStatus(string status) { Status = status; }
		public TxStatus(TapCapSupplier.Client.Model.SignedMessage message) { SignedResponse = message; }
	}
}
