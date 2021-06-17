using NLog;
using NLog.Targets;
using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.Forms;

namespace TheApp
{
	[Target("ViewTarget")]
	public sealed class LogTarget : TargetWithLayout
	{
		private List<string> logMessages = new List<string>();
		public Action<string> Listener;
		public string Messages => string.Join('\n', logMessages);

		public LogTarget()
		{
		}

		protected override void Write(LogEventInfo logEvent)
		{
			string logMessage = Layout.Render(logEvent);
			logMessages.Add(logMessage);
			Device.BeginInvokeOnMainThread(() => Listener?.Invoke(Messages));
		}
	}
}
