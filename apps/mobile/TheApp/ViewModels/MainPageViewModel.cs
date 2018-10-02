using Prism.Commands;
using Prism.Mvvm;
using Prism.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

        private Nethereum.Web3.Accounts.Account Account;

        public DelegateCommand ConnectCommand { get; set; }

        public MainPageViewModel(INavigationService navigationService)
            : base(navigationService)
        {
            Title = "Main Page";

            Logs = "Your Logs Here";

            ConnectCommand = new DelegateCommand(BeginConnect);
        }

        private void BeginConnect()
        {
            NavigationService.NavigateAsync("Connect");
        }

        public override void OnNavigatedTo(NavigationParameters parameters)
        {
            if (parameters.ContainsKey("account"))
            {
                Account = (Nethereum.Web3.Accounts.Account)parameters["account"];
            }
        }
    }
}
