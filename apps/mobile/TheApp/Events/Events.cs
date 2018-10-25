using Prism.Events;
using System;

namespace TheApp.Events
{
	public class AccountUpdated : PubSubEvent<string> { };

	public class TxCompleted : EventBase
	{
		public TapCapSupplier.Client.Model.SignedMessage SignedResponse;
	}
}
