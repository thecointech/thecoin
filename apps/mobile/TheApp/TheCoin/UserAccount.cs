using Nethereum.Web3.Accounts;
using NLog;
using System;
using System.Threading.Tasks;
using TapCapManager.Client.Api;
using TapCapManager.Client.Model;
using TheApp.Tap;
using TheUtils;
using Xamarin.Essentials;


namespace TheApp.TheCoin
{
    public class UserAccount
    {
        static readonly string AccountFile = "TheCoin.TheApp.account";
        static readonly string AccountKey = "TheCoin.TheApp.passwd";

		private Logger logger = LogManager.GetCurrentClassLogger();

		private Account _TheAccount;
        public Account TheAccount
        {
            get => _TheAccount;
            private set
            {
                _TheAccount = value;
                TheContract.Connect(value);
			}
        }

		private TapStatus _status;
		public TapStatus TapStatus
		{
			get => _status;
			private set
			{
				_status = value;
				Events.EventSystem.Publish(new Events.StatusUpdated(value));
			}
		}

		public string Address
		{
			get
			{
				if (TheAccount != null)
					return TheAccount.Address;
				if (EncryptedAccount != null)
				{
					dynamic fromEncrypted = Newtonsoft.Json.JsonConvert.DeserializeObject(EncryptedAccount);
					return fromEncrypted.Address;
				}
				return "----";
			}
		}

        private string EncryptedAccount = null;
        private TheContract TheContract;
        private Task __initTask;
		private IStatusApi StatusApi;
		private ITransactionsApi TransactionsApi;

		////////////////////////////////////////////////////////////////////////////
		/// <summary>
		/// 
		/// </summary>
		/// <param name="theContract"></param>
		public UserAccount(TheContract theContract, IStatusApi tapCapStatus, ITransactionsApi transactions) {
            TheContract = theContract;
			StatusApi = tapCapStatus;
			TransactionsApi = transactions;

			__initTask = Task.Run(AsyncInit);

			Events.EventSystem.Subscribe<Events.TxCompleted>(OnTxComplete);
		}

		private async Task AsyncInit()
        {
            try
            {
                string account = await SecureStorage.GetAsync(AccountFile).ConfigureAwait(false);
                string key = await SecureStorage.GetAsync(AccountKey).ConfigureAwait(false);
                if (account != null && key != null)
                {
                    TheAccount = Account.LoadFromKeyStore(account, key);
					await UpdateToken().ConfigureAwait(false);
				}
			}
            catch (Exception e) {
                Console.WriteLine(e.ToString());
                /* No worries, just no account */
            }
        }

		internal Task MakeReady()
		{
			return __initTask;
		}

        public bool NeedsDecrypting()
        {
            return TheAccount == null && EncryptedAccount != null;
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
				EncryptedAccount = null;
			}
            catch (Exception)
            {
                return false;
            }
            return true;
        }

		public async Task UpdateToken()
		{
			if (_TheAccount == null)
				return;

			try
			{
				// Create a signed TapCapQueryRequest
				var timestamp = TheCoinTime.Now();
				var req = new TapCapQueryRequest(timestamp);
				var (m, s) = Signing.GetMessageAndSignature(req, _TheAccount);
				var signedReq = new SignedMessage(m, s);
				var response = await StatusApi.TapCapStatusAsync(signedReq);

				TapStatus = new TapStatus(response);
			}
			catch (Exception e)
			{
				logger.Error(e, "Could you fuck this up any more?");
			}
		}

		public void OnTxComplete(Events.TxCompleted tx)
		{
			Task.Run(async () =>
			{
				// We simply sign this tx to verify we accepted it
				// and now we send it on to the manager
				//var (supplierAddress, purchase) = Signing.GetSignerAndMessage<TapCapSupplier.Client.Model.TapCapBrokerPurchase>(tx.SignedResponse);

				var (m, s) = Signing.GetMessageAndSignature(tx.SignedResponse, _TheAccount);
				var signedReq = new SignedMessage(m, s);

				var response = await TransactionsApi.TapCapClientAsync(signedReq);
				// TODO: Verify that we have 
				TapStatus = new TapStatus(response);
			});
		}
	}
}
