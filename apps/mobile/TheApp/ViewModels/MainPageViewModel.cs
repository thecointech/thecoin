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

		private bool _ShowingTransactionResult = false;
		public bool ShowingTransactionResult
		{
			get { return this._ShowingTransactionResult; }
			set { SetProperty(ref this._ShowingTransactionResult, value); }
		}


		private Balances balances;

		public ulong MainBalance => balances.MainBalance;
		//public ulong TapCapBalance => balances.TapCapBalance;
		public double CadExchangeRate => balances.FiatBalance;
		public ulong TotalBalance => balances.TotalBalance;
		public double CadBalance => balances.FiatBalance;

		public string _Step1Color = "#777";
		public string Step1Color
		{
			get { return this._Step1Color; }
			set { SetProperty(ref this._Step1Color, value); }
		}
		public string _Step2Color = "#777";
		public string Step2Color
		{
			get { return this._Step2Color; }
			set { SetProperty(ref this._Step2Color, value); }
		}
		public string _Step3Color = "#777";
		public string Step3Color
		{
			get { return this._Step3Color; }
			set { SetProperty(ref this._Step3Color, value); }
		}
		public string _Step4Color = "#777";
		public string Step4Color
		{
			get { return this._Step4Color; }
			set { SetProperty(ref this._Step4Color, value); }
		}
		public string _Step5Color = "#777";
		public string Step5Color
		{
			get { return this._Step5Color; }
			set { SetProperty(ref this._Step5Color, value); }
		}

		public string _Step6Color = "#777";
		public string Step6Color
		{
			get { return this._Step6Color; }
			set { SetProperty(ref this._Step6Color, value); }
		}
		public string _Step7Color = "#777";
		public string Step7Color
		{
			get { return this._Step7Color; }
			set { SetProperty(ref this._Step7Color, value); }
		}
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

				var step = status.Status[6];
				switch(step)
				{
					case '0':
						Step1Color = "#0F0";
						break;
					case '1':
						Step2Color = "#0F0";
						break;
					case '2':
						Step3Color = "#0F0";
						break;
					case '3':
						Step4Color = "#0F0";
						break;
					case '4':
						Step5Color = "#0F0";
						break;
					case '5':
						Step6Color = "#0F0";
						break;
					case '6':
						Step7Color = "#0F0";
						ShowingTransactionResult = true;
						break;
				}
			}
			else
			{
				Logs = "--Ready--";
				TestEnabled = true;
				Step1Color = Step2Color = Step3Color = Step4Color = "#777";

				_ = Task.Run(async () =>
				{
					await Task.Delay(15000);
					ShowingTransactionResult = false;
				});
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
