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

    public class ConnectViewModel : ViewModelBase
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
            get { return this.EncryptedAccount.Length > 1; }
        }

        private string EncryptedAccount = "";

        public DelegateCommand ScanCommand { get; set; }
        public DelegateCommand TryDecryptCommand { get; set; }

        public ConnectViewModel(INavigationService navigationService) : base(navigationService)
        {
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
            try
            {
                State = "Attempting decryption";
                // First, verify the account pwd
                var account = Nethereum.Web3.Accounts.Account.LoadFromKeyStore(EncryptedAccount, Password);
                // Store either the encrypted or decrypted account
                // For now, we will store the decrypted account, as it takes
                // quite a long time to decrypt
                string decryptedAccount = JsonConvert.SerializeObject(account);
                await SecureStorage.SetAsync("TheCoin.TheApp.account", decryptedAccount);
                await SecureStorage.SetAsync("TheCoin.TheApp.pass", Password);

                // Go back to the main page with our newly opened account
                await NavigationService.GoBackAsync(new NavigationParameters()
                {
                    { "account", decryptedAccount }
                });
            }
            catch (Exception err)
            {
                State = err.ToString();
            }

        }

        private class AccountInfo
        {
            public string address;
        }

        public override void OnNavigatedTo(NavigationParameters parameters) 
        {
            if (parameters.ContainsKey("account"))
            {

                try
                {
                    EncryptedAccount = parameters["account"].ToString();

                    AccountInfo info = new AccountInfo();
                    info.address = "NotNull";
                    JsonConvert.PopulateObject(EncryptedAccount, info);
                    Address = info.address;
                }
                catch (Exception /*e*/)
                {
                    State = "Read Account Failed";
                    EncryptedAccount = "";
                    Address = "";
                }
            }
        }
    }
}
