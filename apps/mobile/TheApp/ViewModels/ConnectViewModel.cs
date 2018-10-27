using Prism.Commands;
using Prism.Mvvm;
using Prism.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using Xamarin.Forms;
using ZXing.Net.Mobile.Forms;
using Newtonsoft.Json;
using Xamarin.Essentials;

namespace TheApp.ViewModels
{

    internal class ConnectViewModel : ViewModelBase
	{
        private string _Address;
        public string Address
        {
            get { return this._Address; }
            set { SetProperty(ref this._Address, value); }
        }

        private string _State;
        public string State
        {
            get { return this._State; }
            set { SetProperty(ref this._State, value); }
        }

        private string _Password;
        public string Password
        {
            get { return this._Password; }
            set { SetProperty(ref this._Password, value); }
        }

        public bool CanUnlock
        {
            get => UserAccount.NeedsDecrypting();
        }

        public DelegateCommand ScanCommand { get; set; }
        public DelegateCommand TryDecryptCommand { get; set; }

        private TheCoin.UserAccount UserAccount;

        public ConnectViewModel(INavigationService navigationService, TheCoin.UserAccount userAccount) : base(navigationService)
        {
            UserAccount = userAccount;

            ScanCommand = new DelegateCommand(Scan);
            TryDecryptCommand = new DelegateCommand(TryDecrypt);
            State = "Scan for new account";
        }

        private void Scan()
        {
            NavigationService.NavigateAsync("Scanner");
        }

        private async void TryDecrypt()
        {
            State = "Attempting decryption";
            if (await UserAccount.TryDecrypt(Password))
            {
                // Go back to the main page with our newly opened account
                await NavigationService.GoBackAsync();
            }
            else
            {
                State = "Key Failed";
            }
        }

		public override void OnNavigatedTo(INavigationParameters parameters) 
        {
			Address = UserAccount.Address;
        }
    }
}
