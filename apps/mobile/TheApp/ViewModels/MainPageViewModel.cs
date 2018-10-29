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
		private string _Logs;
		public string Logs
		{
			get { return this._Logs; }
			set { SetProperty(ref this._Logs, value); }
		}

		private bool _TestEnabled = false;
		public bool TestEnabled
		{
			get { return this._TestEnabled; }
			set { SetProperty(ref this._TestEnabled, value); }
		}


		private Balances balances;

		public ulong MainBalance => balances.MainBalance;
		public ulong TapCapBalance => balances.TapCapBalance;
		public double CadExchangeRate => balances.FiatBalance;
		public ulong TotalBalance => balances.TotalBalance;
		public double CadBalance => balances.FiatBalance;

		public bool CanConnect { get => true; }

		private TransactionProcessor Transaction;

		public DelegateCommand TestPurchaseCommand { get; set; }
		public DelegateCommand ConnectCommand { get; set; }

		public MainPageViewModel(INavigationService navigationService, Balances balances, TransactionProcessor transactions)
			: base(navigationService)
		{
			Title = "Main Page";
			Logs = "-- Loading Account --";

			Transaction = transactions;
			this.balances = balances;

			TestPurchaseCommand = new DelegateCommand(TestPurchase);
			ConnectCommand = new DelegateCommand(BeginConnect);

			Events.EventSystem.Subscribe<Events.BalancesUpdated>((u) => UpdateBalances(u.Update));
			Events.EventSystem.Subscribe<Events.SetActiveAccount>((u) => { Logs = "Loaded"; }, ThreadOption.UIThread);
			Events.EventSystem.Subscribe<Events.TxStatus>(UpdateTxStatus, ThreadOption.UIThread);
		}

		private void BeginConnect()
		{
			NavigationService.NavigateAsync("Connect");
		}

		private void TestPurchase()
		{
			Logs = "Running Text Tx";
			Task.Run(() =>
			{
				var testing = new TapTesting(Transaction);
				bool res = testing.TestFull();
			});
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
			if (status.SignedResponse != null)
			{
				Logs = "Tx Completed";
			}
			else if (status.Step > 0)
			{
				Logs = "Tx Step: " + status.Step;
			}
			else
			{
				TestEnabled = true;
			}
		}

		void UpdateBalances(Balances update)
		{
			balances = update;
			RaisePropertyChanged("TapCapBalance");
			RaisePropertyChanged("TotalBalance");
			RaisePropertyChanged("CadBalance");
		}

	}
}
