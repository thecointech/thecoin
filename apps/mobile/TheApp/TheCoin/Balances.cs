using NLog;
using Prism.Events;
using System.Threading.Tasks;
using ThePricing.Api;
using ThePricing.Model;
using TheUtils;

namespace TheApp.TheCoin
{
    public class Balances
    {
		private Logger logger = LogManager.GetCurrentClassLogger();

		public ulong MainBalance;
		//public ulong TapCapBalance;

		public double ExchangeRate => fxRate?.Buy * fxRate?._FxRate ?? 1;
		public ulong TotalBalance => MainBalance /*+ TapCapBalance*/;
		public double FiatBalance => TheUtils.TheContract.ToHuman((ulong)(TotalBalance * ExchangeRate));

		public int FxCountryCode = 124;

		private IRatesApi ratesApi;
		private FXRate fxRate;
		//private SubscriptionToken _statusUpdateSub;
		private SubscriptionToken _newAccountSub;

		private UserAccount account;
		private TheContract contract;

		public Balances(UserAccount account, TheContract contract, IRatesApi ratesApi)
		{
			//_statusUpdateSub = Events.EventSystem.Subscribe<Events.StatusUpdated>(OnTapStatusUpdate, ThreadOption.UIThread);
			_newAccountSub = Events.EventSystem.Subscribe<Events.SetActiveAccount>(OnSetActiveAccount, ThreadOption.UIThread);

			this.ratesApi = ratesApi;
			this.account = account;
			this.contract = contract;
		}

		//private void OnTapStatusUpdate(Events.StatusUpdated newStatus)
		//{
		//	TapCapBalance = newStatus.Status.Balance;
		//	Events.EventSystem.Publish(new Events.BalancesUpdated(this));
		//}

		private void OnSetActiveAccount(Events.SetActiveAccount setActive)
		{
			account = setActive.Account;
			Task.Run(UpdateBalances);
		}

		private async Task UpdateBalances()
		{
			if (account.TheAccount == null)
				return;

			try
			{
				// TODO: Watch valitity interval and update when necessary
				var now = TheCoinTime.Now();
				var FXRateWait = ratesApi.GetSingleAsync(FxCountryCode, now).ConfigureAwait(false);
				var balanceWait = contract.Contract.CoinBalance().ConfigureAwait(false);

				fxRate = await FXRateWait;
				MainBalance = await balanceWait;
				//TapCapBalance = account.Status?.Balance ?? 0;

				Events.EventSystem.Publish(new Events.BalancesUpdated(this));
			}
			catch (System.Exception e)
			{
				logger.Error(e, "Oh No! Couldn't update balances");
			}
		}
	}
}
