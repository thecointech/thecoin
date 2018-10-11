using Nethereum.Web3.Accounts;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TapCap.Client.Model;
using Xamarin.Essentials;

using Nethereum.ABI.Encoders;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Util;
using Nethereum.Signer;

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

        public object Token { get; internal set; }

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

        private static string CreateStringSignature(EthECDSASignature signature)
        {
            return "0x" + signature.R.ToHex().PadLeft(64, '0') +
                   signature.S.ToHex().PadLeft(64, '0') +
                   signature.V.ToHex();
        }

        public SignedMessage MakeSignedMessage(object obj)
        {
            var message = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            var signer = new EthereumMessageSigner();
            var signature = signer.EncodeUTF8AndSign(message, new EthECKey(TheAccount.PrivateKey));
            return new SignedMessage(message, signature);
        }
    }
}
