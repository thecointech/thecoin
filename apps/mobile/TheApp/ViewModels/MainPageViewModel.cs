using NLog;
using Prism.Commands;
using Prism.Events;
using Prism.Navigation;
using System;
using System.Threading;
using System.Threading.Tasks;
using TheApp.Tap;
using TheApp.TheCoin;

namespace TheApp.ViewModels
{
	public class MainPageViewModel : ViewModelBase
	{
		private Logger logger = LogManager.GetCurrentClassLogger();

		private string _Logs;
		public string Logs
		{
			get { return this._Logs; }
			set { SetProperty(ref this._Logs, value); }
		}

		private bool _TestEnabled = true;
		public bool TestEnabled
		{
			get { return this._TestEnabled; }
			set {
				if (value == _TestEnabled)
					return;
				SetProperty(ref this._TestEnabled, value);
				TestPurchaseCommand.RaiseCanExecuteChanged();
			}
		}


		private Balances balances;

		public ulong MainBalance => balances.MainBalance;
		//public ulong TapCapBalance => balances.TapCapBalance;
		public double CadExchangeRate => balances.FiatBalance;
		public ulong TotalBalance => balances.TotalBalance;
		public double CadBalance => balances.FiatBalance;

		public bool CanConnect { get => true; }

		private TapTesting Tester;

		public DelegateCommand TestPurchaseCommand { get; set; }
		public DelegateCommand ConnectCommand { get; set; }
		public DelegateCommand ShowHistoryCommand { get; set; }
		public DelegateCommand ShowLogsCommand { get; set; }

		public MainPageViewModel(INavigationService navigationService, Balances balances, TapTesting tester)
			: base(navigationService)
		{
			Title = "Main Page";
			Logs = "-- No Account Detected --";

			logger.Trace("Main Page Loaded on thread {0}", Environment.CurrentManagedThreadId);

			Tester = tester;
			this.balances = balances;

			ShowHistoryCommand = new DelegateCommand(ShowHistory);
			ShowLogsCommand = new DelegateCommand(ShowLogs);
			TestPurchaseCommand = new DelegateCommand(TestPurchase, () => TestEnabled);
			ConnectCommand = new DelegateCommand(BeginConnect);

			Events.EventSystem.Subscribe<Events.BalancesUpdated>((u) => UpdateBalances(u.Update), ThreadOption.UIThread);
			Events.EventSystem.Subscribe<Events.SetActiveAccount>((u) => { Logs = "Loaded"; }, ThreadOption.UIThread);
			Events.EventSystem.Subscribe<Events.TxStatus>(UpdateTxStatus, ThreadOption.UIThread);
		}

		private void ShowHistory()
		{
			NavigationService.NavigateAsync("History");
		}
		private void ShowLogs()
		{
			NavigationService.NavigateAsync("Logs");
		}
		private void BeginConnect()
		{
			NavigationService.NavigateAsync("Connect");
		}

		private void TestPurchase()
		{
			Logs = "Running Test Tx";

			Tester.TestFull();
		}

		CancellationTokenSource source = new CancellationTokenSource();


		public override void OnNavigatedFrom(INavigationParameters parameters)
		{
		}

		public override void OnNavigatedTo(INavigationParameters parameters)
		{
			UpdateBalances(balances);
		}

		void UpdateTxStatus(Events.TxStatus status)
		{
			if (status.Response != null)
			{
				Logs = "Tx Completed";
				TestEnabled = true;
			}
			else if (status.Status != null)
			{
				string res = String.Format("Paying ${0}: {1}", status.Amount, status.Status);
				Logs = res;
				TestEnabled = false;
			}
			else
			{
				Logs = "--Ready--";
				TestEnabled = true;
			}
		}

		void UpdateBalances(Balances update)
		{
			balances = update;
			//RaisePropertyChanged("TapCapBalance");
			RaisePropertyChanged("TotalBalance");
			RaisePropertyChanged("CadBalance");
		}

	}
}
