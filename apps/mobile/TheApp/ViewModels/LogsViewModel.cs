using NLog;
using Prism.Navigation;
using System;
using System.Collections.Generic;
using System.Text;

namespace TheApp.ViewModels
{
	public class LogsViewModel : ViewModelBase
	{
		private string _AllLogs = "Your Initial Logs";
		private LogTarget _logTarget;

		public string AllLogs
		{
			get { return this._AllLogs; }
			set { SetProperty(ref this._AllLogs, value); }
		}


		public LogsViewModel(INavigationService navigationService, LogTarget logTarget)
			: base(navigationService)
		{
			_logTarget = logTarget;
		}

		public override void OnNavigatingTo(INavigationParameters parameters)
		{
			_logTarget.Listener = s => AllLogs = s;
			AllLogs = _logTarget.Messages;
		}
		public override void OnNavigatedFrom(INavigationParameters parameters)
		{
			_logTarget.Listener = null;
		}
	}
}
