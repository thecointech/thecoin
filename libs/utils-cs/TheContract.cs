using Newtonsoft.Json.Linq;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Threading.Tasks;
using System;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Collections.Generic;
using Nethereum.Contracts;
using System.Numerics;

namespace TheUtils
{
    public class TheContract
    {
        //
        // NOTE: We deal in ULONG for coin rather than BigInt
        // due to the fact that max value for ULONG would be roughly
        // 18 trillion dollars, and we won't reach that valuation
        // before we do a code review of this stuff at least.
        //

        //readonly Nethereum.Contracts.Contract TheCoinContract;
        readonly Web3 web3;
        readonly Nethereum.StandardTokenEIP20.StandardTokenService TheCoinToken;
        readonly Nethereum.Contracts.Contract TheCoinContract;

        private Account account;

        public TheContract(string theCoinStr, Web3 customWeb3=null)
        {
            JObject theCoinJson = JObject.Parse(theCoinStr);

            if (customWeb3 != null)
                web3 = customWeb3;
            else
                web3 = new Web3("https://ropsten.infura.io/3Ph3BvTtfMZn32IZ8jhk");

            string address = theCoinJson["networks"]["3"]["address"].ToString();
            TheCoinToken = new Nethereum.StandardTokenEIP20.StandardTokenService(web3, address);
            TheCoinContract = web3.Eth.GetContract(theCoinJson["abi"].ToString(), address);
        }

        public void Connect(Account user)
        {
            account = user;
        }

        public async Task<ulong> CoinAvailable()
        {
            var fnSupply = TheCoinContract.GetFunction("totalSupply");

            var totalSupply = await fnSupply.CallAsync<ulong>();
            return totalSupply;
        }

        public async Task<ulong> CoinBalance()
        {
            //var res = await TheCoinToken.GetBalanceOfAsync<ulong>(account.Address);
            var fnBalance = TheCoinContract.GetFunction("balanceOf");
            return await fnBalance.CallAsync<ulong>(account.Address);
        }

        public async Task<ulong> GetTapCap(string userAddress, string manager= "0x0774b5aBaa87e33E47b336A88b337E2711C27ca2")
        {
            var fnSupply = TheCoinContract.GetFunction("getUserSpendingAccount");
            var totalSupply = await fnSupply.CallAsync<ulong>(manager, userAddress);
            return totalSupply;
        }

        const int exp = 1000000;
        public static double ToHuman(ulong bcoin, int numDecimalPlaces = 2)
        {
            double hcoins = (double)bcoin / exp;
            // TODO: Consider fixing this rounding to be floor/ceil.
            return Math.Round(hcoins, numDecimalPlaces);
        }

        public static long ToCoin(double val)
        {
            return (long)(val * exp);
        }

        public static ulong ApplyMarkups(ulong coin, double feePercent, ulong feeMinimum, ulong feeMaximum)
        {
            double commission = coin * feePercent;
            commission = Math.Min(commission, feeMaximum);
            commission = Math.Max(commission, feeMinimum);

            return (ulong)(coin + commission);
        }

        public static ulong CurrencyToCoin(ulong cents, double coinToUsd, double usdFx)
        {
            // Scale into coin first, as it should have the least issue with precision
            double asCoin = ToCoin(cents);
            // Scale the divisors 
            double divisor = 100 * coinToUsd * usdFx;
            return (ulong)(asCoin / divisor);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="coin"></param>
        /// <param name="coinToUsd"></param>
        /// <param name="usdFx"></param>
        /// <returns></returns>
        public static double CoinToCurrency(ulong coin, double coinToUsd, double usdFx) 
        {
            var currencyMult = ((coin * coinToUsd) * usdFx);
            return ToHuman((ulong)currencyMult);
        }


        public class TapCapTopUp
        {
            [Parameter("address", "manager", 1, false)]
            public string Manager { get; set; }

            [Parameter("address", "client", 2, false)]
            public string Client { get; set; }

            [Parameter("uint256", "topup", 3, false)]
            public BigInteger TopUp { get; set; }
        }

        public async Task<List<EventLog<TapCapTopUp>>> GetCapTapTopUps(ulong fromBlock = 0, ulong toBlock = 0)
        {
            var topUpEventLog = TheCoinContract.GetEvent("SpendingTopUp");
            var from = fromBlock > 0 ? new BlockParameter(fromBlock) : null;
            var to = toBlock > 0 ? new BlockParameter(toBlock) : null;

            var filterInput = topUpEventLog.CreateFilterInput(from, to);
            var logs = await topUpEventLog.GetAllChanges<TapCapTopUp>(filterInput);
            return logs;
        }


        public class CoinsPurchased
        {
            [Parameter("address", "targetAddress", 1, false)]
            public string Purchaser { get; set; }

            [Parameter("uint256", "amount", 2, false)]
            public BigInteger Amount { get; set; }

            [Parameter("uint256", "newBalance", 3, false)]
            public BigInteger NewBalance { get; set; }

            [Parameter("uint256", "timestamp", 4, false)]
            public BigInteger TimeStamp { get; set; }

        }

        public async Task<List<EventLog < CoinsPurchased> >> GetPurchases(string address, ulong fromBlock = 0, ulong toBlock = 0)
        {
            var bidAddedEventLog = TheCoinContract.GetEvent("CoinsPurchased");
            var from = fromBlock > 0 ? new BlockParameter(fromBlock) : null;
            var to = toBlock > 0 ? new BlockParameter(toBlock) : BlockParameter.CreateLatest();


            var filterInput = bidAddedEventLog.CreateFilterInput(from, to);
            var logs = await bidAddedEventLog.GetAllChanges<CoinsPurchased>(filterInput);

            return logs;
        }

        public async Task<List<EventLog<CoinsPurchased>>> test(ulong fromBlock = 3259000, ulong toBlock = 0)
        {
            var bidAddedEventLog = TheCoinContract.GetEvent("CoinsPurchased");
            var from = fromBlock > 0 ? new BlockParameter(fromBlock) : null;
            var to = toBlock > 0 ? new BlockParameter(toBlock) : BlockParameter.CreateLatest();

            var filterInput = bidAddedEventLog.CreateFilterInput(from, to);
            var logs = await bidAddedEventLog.GetAllChanges<CoinsPurchased>(filterInput);
            foreach (var item in logs)
            {
                ;
            }

            return logs;
        }
    }
}
