using Prism.Events;
using TheApp.Tap;

namespace TheApp.Events
{
	public class StatusUpdated : EventBase
	{
		internal TapStatus Status;
		public StatusUpdated() { }
		internal StatusUpdated(TapStatus status)
		{
			Status = status;
		}
	}
}
