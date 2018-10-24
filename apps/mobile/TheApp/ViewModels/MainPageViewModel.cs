using Prism.Commands;
using Prism.Navigation;
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
            set {
                SetProperty(ref this._MainBalance, value);
                RaisePropertyChanged("TotalBalance");
                RaisePropertyChanged("CadBalance");
            }
        }

        private ulong _TapCapBalance;
        public ulong TapCapBalance
        {
            get { return this._TapCapBalance; }
            set {
                SetProperty(ref this._TapCapBalance, value);
                RaisePropertyChanged("TotalBalance");
                RaisePropertyChanged("CadBalance");
            }
        }

        private double _CadExchangeRate = 1;
        public double CadExchangeRate
        {
            get { return this._CadExchangeRate; }
            set {
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

        public MainPageViewModel(INavigationService navigationService, TheContract theContract, IRatesApi ratesApi, TheCoin.UserAccount userAccount, TransactionProcessor transactions)
            : base(navigationService)
        {
            Title = "Main Page";
            Logs = "Your Logs Here";

            TheContract = theContract;
            Rates = ratesApi;
            UserAccount = userAccount;
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
				bool res = await Transaction.TryTestTx();
				Xamarin.Forms.Device.BeginInvokeOnMainThread(() =>
				{
					Logs = "Test completed successfully: " + res;
				});
			});
		}

        public override async void OnNavigatedTo(NavigationParameters parameters)
        {
			await UserAccount.MakeReady();

            if (UserAccount.TheAccount != null)
            {
                var now = TheCoinTime.Now();
                var FXRate = await Rates.GetConversionAsync(124, now);
                CadExchangeRate = FXRate.Buy.GetValueOrDefault(1) * FXRate._FxRate.GetValueOrDefault(1);
				MainBalance = await TheContract.CoinBalance();
				TapCapBalance = UserAccount.TapCapBalance;

				await Transaction.MakeReady();
			}
		}
    }
}
