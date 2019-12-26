using Prism.Events;
using System;

namespace TheApp.Events
{
	public class AccountUpdated : PubSubEvent<string> { };
}
