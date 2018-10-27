using Prism.Commands;
using Prism.Events;
using Prism.Navigation;
using System;
using System.Threading;
using System.Threading.Tasks;
using TapCapManager.Client.Api;
using TheApp.Tap;
using ThePricing.Api;
using TheUtils;

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

		private ulong _MainBalance;
		public ulong MainBalance
		{
			get { return this._MainBalance; }
			set
			{
				SetProperty(ref this._MainBalance, value);
				RaisePropertyChanged("TotalBalance");
				RaisePropertyChanged("CadBalance");
			}
		}

		private ulong _TapCapBalance;
		public ulong TapCapBalance
		{
			get { return this._TapCapBalance; }
			set
			{
				SetProperty(ref this._TapCapBalance, value);
				RaisePropertyChanged("TotalBalance");
				RaisePropertyChanged("CadBalance");
			}
		}

		private double _CadExchangeRate = 1;
		public double CadExchangeRate
		{
			get { return this._CadExchangeRate; }
			set
			{
				SetProperty(ref this._CadExchangeRate, value);
				RaisePropertyChanged("CadBalance");
			}
		}

		public ulong TotalBalance
		{
			get { return MainBalance + TapCapBalance; }
		}

		public double CadBalance
		{
			get { return TheContract.ToHuman((ulong)(TotalBalance * CadExchangeRate)); }
		}

		public bool CanConnect { get => UserAccount.NeedsDecrypting(); }

		private TheCoin.UserAccount UserAccount;
		private TheContract TheContract;

		private IRatesApi Rates;
		private TransactionProcessor Transaction;

		public DelegateCommand TestPurchaseCommand { get; set; }
		public DelegateCommand ConnectCommand { get; set; }

		public MainPageViewModel(INavigationService navigationService, TheContract theContract, IRatesApi ratesApi, TransactionProcessor transactions)
			: base(navigationService)
		{
			Title = "Main Page";
			Logs = "Your Logs Here";

			TheContract = theContract;
			Rates = ratesApi;
			//UserAccount = userAccount;
			Transaction = transactions;

			TestPurchaseCommand = new DelegateCommand(TestPurchase);
			ConnectCommand = new DelegateCommand(BeginConnect);
		}

		private void BeginConnect()
		{
			NavigationService.NavigateAsync("Connect");
		}

		private void TestPurchase()
		{
			Task.Run(async () =>
			{
				bool res = await Transaction.TryTestTx().ConfigureAwait(false);
				Xamarin.Forms.Device.BeginInvokeOnMainThread(() =>
				{
					Logs = "Test completed successfully: " + res;
				});
			});
		}

		CancellationTokenSource source = new CancellationTokenSource();
		private SubscriptionToken _statusUpdateSub;
		private SubscriptionToken _newAccountSub;

		public override void OnNavigatedFrom(INavigationParameters parameters)
		{
			Events.EventSystem.Unsubscribe<Events.StatusUpdated>(_statusUpdateSub);
			Events.EventSystem.Unsubscribe<Events.SetActiveAccount>(_newAccountSub);
		}

		public override void OnNavigatedTo(INavigationParameters parameters)
		{
			_statusUpdateSub = Events.EventSystem.Subscribe<Events.StatusUpdated>(OnTapStatusUpdate, ThreadOption.UIThread);
			_newAccountSub = Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount, ThreadOption.UIThread);

			Logs = "Account Init: " + UserAccount.Address;
			Task.Run(UpdateBalances);
		}

		private void OnTapStatusUpdate(Events.StatusUpdated newStatus)
		{
			TapCapBalance = newStatus.Status.Balance;
		}

		private void OnSetActiveAccount(Events.SetActiveAccount setActive)
		{
			UserAccount = setActive.Account;
			Task.Run(UpdateBalances);
		}

		private async Task UpdateBalances()
		{
			if (UserAccount.TheAccount == null)
				return;

			try
			{
				var now = TheCoinTime.Now();
				var FXRateWait = Rates.GetConversionAsync(124, now).ConfigureAwait(false);
				var balanceWait = TheContract.CoinBalance().ConfigureAwait(false);

				var FXRate = await FXRateWait;
				var balance = await balanceWait;
				Xamarin.Forms.Device.BeginInvokeOnMainThread(() =>
				{
					CadExchangeRate = FXRate.Buy.GetValueOrDefault(1) * FXRate._FxRate.GetValueOrDefault(1);
					MainBalance = balance;
					TapCapBalance = UserAccount.Status.Balance;
				});
			}
			catch (System.Exception e)
			{
				Logs = "Oh No! " + e.Message;
			}
		}
	}
}
