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
		}

		private void BeginConnect()
		{
			NavigationService.NavigateAsync("Connect");
		}

		private void TestPurchase()
		{
			Task.Run(() =>
			{
				var testing = new TapTesting(Transaction);
				bool res = testing.TestFull();
				Xamarin.Forms.Device.BeginInvokeOnMainThread(() =>
				{
					Logs = "Test completed successfully: " + res;
				});
			});
		}

		CancellationTokenSource source = new CancellationTokenSource();


		public override void OnNavigatedFrom(INavigationParameters parameters)
		{
		}

		public override void OnNavigatedTo(INavigationParameters parameters)
		{
			//Logs = "Account Init: " + UserAccount.Address;
			UpdateBalances(balances);

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
