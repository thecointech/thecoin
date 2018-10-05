using Nethereum.Web3.Accounts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Essentials;

namespace TheApp.TheCoin
{
    public class UserAccount
    {
        static readonly string AccountFile = "TheCoin.TheApp.account";
        static readonly string AccountKey = "TheCoin.TheApp.passwd";

        private Account _TheAccount;
        public Account TheAccount
        {
            get {
                // Wait till the initialization has finished
                if (InitTask != null)
                {
                    InitTask.GetAwaiter().GetResult();
                    InitTask = null;
                }
                return _TheAccount;
            }
            private set
            {
                _TheAccount = value;
                TheContract.Connect(value);
            }
        }

        private string EncryptedAccount = null;
        private TheUtils.TheContract TheContract;
        private Task InitTask;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="theContract"></param>
        public UserAccount(TheUtils.TheContract theContract) {
            TheContract = theContract;
            InitTask = Task.Run(TryInit);
        }

        private async Task TryInit()
        {
            try
            {
                string account = await SecureStorage.GetAsync(AccountFile);
                string key = await SecureStorage.GetAsync(AccountKey);
                if (account != null && key != null)
                {
                    TheAccount = Account.LoadFromKeyStore(account, key);
                }
            }
            catch (Exception e) {
                Console.WriteLine(e.ToString());
                /* No worries, just no account */
            }
        }

        public bool NeedsDecrypting()
        {
            return TheAccount == null && EncryptedAccount == null;
        }

        public async Task SetEncrypted(string encrypted)
        {
            EncryptedAccount = encrypted;
            await SecureStorage.SetAsync(AccountFile, encrypted);
        }

        public async Task<bool> TryDecrypt(string key)
        {
            try
            {
                // First, verify the account pwd
                var TheAccount = Account.LoadFromKeyStore(EncryptedAccount, key);
                // If we are here, then success
                await SecureStorage.SetAsync(AccountKey, key);
            }
            catch (Exception)
            {
                return false;
            }
            return true;
        }
    }
}
