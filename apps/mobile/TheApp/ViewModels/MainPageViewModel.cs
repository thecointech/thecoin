using Prism.Commands;
using Prism.Navigation;
using TheUtils;
using TheCoinCore.Api;

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

        public DelegateCommand ConnectCommand { get; set; }

        public MainPageViewModel(INavigationService navigationService, TheContract theContract, IRatesApi ratesApi, TheCoin.UserAccount userAccount)
            : base(navigationService)
        {
            Title = "Main Page";
            Logs = "Your Logs Here";

            TheContract = theContract;
            Rates = ratesApi;
            UserAccount = userAccount;

            ConnectCommand = new DelegateCommand(BeginConnect);
        }

        private void BeginConnect()
        {
            NavigationService.NavigateAsync("Connect");
        }

        public override async void OnNavigatedTo(NavigationParameters parameters)
        {
            if (UserAccount.TheAccount != null)
            {
                var now = TheCoinTime.Now();
                var FXRate = await Rates.GetConversionAsync(127, now);
                CadExchangeRate = FXRate.Buy.GetValueOrDefault(1) * FXRate._FxRate.GetValueOrDefault(1);
                MainBalance = await TheContract.CoinBalance();
            }
        }
    }
}
