using Nethereum.Web3.Accounts;
using NLog;
using System;
using System.Threading.Tasks;
using TapCapSupplier.Client.Api;
//using TapCapManager.Client.Api;
//using TapCapManager.Client.Model;
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

		public Account TheAccount { get; private set; }

		//private TapStatus _status;
		//public TapStatus Status
		//{
		//	get => _status;
		//	private set
		//	{
		//		_status = value;
		//		logger.Info("TapStatus Updated");
		//		Events.EventSystem.Publish(new Events.StatusUpdated(value));
		//	}
		//}

		public string Address
		{
			get
			{
				if (TheAccount != null)
					return TheAccount.Address;
				if (EncryptedAccount != null)
				{
					var json = Newtonsoft.Json.Linq.JObject.Parse(EncryptedAccount);
					//var addr = fromEncrypted.address;
					//var data = fromEncrypted.
					return json["address"].ToString();
				}
				return "----";
			}
		}

        private string EncryptedAccount = null;
		//private IStatusApi StatusApi;
		private ITransactionApi TransactionsApi;

		////////////////////////////////////////////////////////////////////////////
		/// <summary>
		/// 
		/// </summary>
		/// <param name="theContract"></param>
		public UserAccount(/*IStatusApi tapCapStatus, */ITransactionApi transactions) {
			//StatusApi = tapCapStatus;
			TransactionsApi = transactions;

			Task.Run(AsyncInit);

			Events.EventSystem.Subscribe<Events.TxStatus>(OnTxStatus);
		}

		public static implicit operator Account(UserAccount v) => v.TheAccount;

		private async Task AsyncInit()
        {
            try
            {
				EncryptedAccount = await SecureStorage.GetAsync(AccountFile).ConfigureAwait(false);
                string key = await SecureStorage.GetAsync(AccountKey).ConfigureAwait(false);
                if (EncryptedAccount != null && key != null)
                {
					Events.EventSystem.Publish(new Events.TxStatus("-- Attempting Load --"));
					bool success = await TryDecrypt(key).ConfigureAwait(false);
				}
			}
            catch (Exception e) {
                Console.WriteLine(e.ToString());
                /* No worries, just no account */
            }
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
				logger.Info("Attemping Decrypt");
				// First, verify the account pwd
				TheAccount = Account.LoadFromKeyStore(EncryptedAccount, key);

				logger.Info("Decrypt Successfuly");
				// If we are here, then success
				Events.EventSystem.Publish(new Events.SetActiveAccount(this));
				// Always get a new token on new account.
				//await UpdateToken().ConfigureAwait(false);
				await SecureStorage.SetAsync(AccountKey, key).ConfigureAwait(false);
				EncryptedAccount = null;
			}
            catch (Exception)
            {
                return false;
            }
            return true;
        }

		public void UpdateToken()
		{
			if (TheAccount == null)
				return;

			//try
			//{
			//	// Create a signed TapCapQueryRequest
			//	var timestamp = TheCoinTime.Now();
			//	var req = new TapCapQueryRequest(timestamp);
			//	var (m, s) = Signing.GetMessageAndSignature(req, TheAccount);
			//	var signedReq = new SignedMessage(m, s);
			//	var response = await StatusApi.TapCapStatusAsync(signedReq);

			//	Status = new TapStatus(response);
			//}
			//catch (Exception e)
			//{
			//	logger.Error(e, "Could you fuck this up any more?");
			//}
		}

		public void OnTxStatus(Events.TxStatus tx)
		{
			if (tx.Response != null)
			{
				//Task.Run(async () =>
				//{
				//	// We simply sign this tx to verify we received it
				//	// and now we send it on to the manager
				//	//var (supplierAddress, purchase) = Signing.GetSignerAndMessage<TapCapSupplier.Client.Model.TapCapBrokerPurchase>(tx.SignedResponse);

				//	var (m, s) = Signing.GetMessageAndSignature(tx.SignedResponse, TheAccount);
				//	var signedReq = new SignedMessage(m, s);

				//	var response = await TransactionsApi.TapCapClientAsync(signedReq);
				//	// TODO: Verify that we have 
				//	Status = new TapStatus(response);
				//});
			}
		}
	}
}
