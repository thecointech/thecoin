using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PuppeteerSharp;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TheBankAPI
{
	public class BalanceAPI
	{
		ILogger logger;
		private Browser browser;
		private Page page;

		private Task initTask;
		private Newtonsoft.Json.Linq.JArray commands;
		private dynamic txPageData;

		public BalanceAPI(string appdir)
		{
			initTask = Initialize(appdir);
		}

		/// <summary>
		///  Returns an awaitable task callers may
		///  wait on to ensure app is ready
		/// </summary>
		/// <returns></returns>
		public Task InitializeTask()
		{
			return initTask;
		}

		/// <summary>
		/// Gets a list of the 10 most recent transactions
		/// </summary>
		/// <returns></returns>
		public async Task<Transaction[]> GetLatestTransactions()
		{
			await EnsurePageLoaded();

			string txTarget = txPageData.Target;
			var selector = await GetSelector(txTarget);
			await page.WaitForSelectorAsync(selector);
			var rawResults = await GetRawTransactions();
			return await ConvertToPublicTransactions(rawResults);
		}

		async Task EnsurePageLoaded()
		{
			if (page == null)
			{
				await ReInitializePage();
			}
			else
			{
				// If we have a valid page, then
				// we can simply reload it and hope that
				// we are still logged in.  We test
				// login state via 
				await page.ReloadAsync();
				// Check to see if the refreshed page is the
				// one we are looking for
				bool isValid = await VerifyStatementPage();
				// If not, then lets reload the page from scratch
				if (!isValid)
				{
					await ReInitializePage();
				}
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////

		/// <summary>
		/// Does the page contain the information we are searcing for?
		/// </summary>
		/// <returns></returns>
		async Task<bool> VerifyStatementPage()
		{
			string target = txPageData.Target;
			string selector = await GetSelector(target);
			var results = await page.QuerySelectorAllAsync(selector);
			return results.Length > 0;
		}

		async Task ReInitializePage()
		{
			var counter = 0;
			foreach (dynamic command in commands)
			{
				string action = command.Command;
				string target = command.Target;
				Console.WriteLine("Processing {0} - {1}", action, target);

				switch (action)
				{
					case "open":
						{
							await page.GoToAsync(target);
							break;
						}
					case "clickAndWait":
						{
							string selector = await GetSelector(target);
							await page.ClickAsync(selector);
							break;
						}
					case "type":
						{
							string value = command.Value;
							await EnterText(target, value);
							break;
						}
					case "click":
						{
							string selector = await GetSelector(target);
							await page.ClickAsync(selector);
							if (selector.EndsWith("button"))
							{
								await page.WaitForNavigationAsync();
							}
							break;
						}
				}
				counter++;
				await page.ScreenshotAsync($@"c:\temp\screenshot{counter}.png");
			}
		}

		async Task<string> GetSelector(string target)
		{
			if (target.StartsWith("//*"))
			{
				// "//*[@id=\"rbunxcgi\"]/fieldset/div[2]/div[1]/button",
				// becomes
				// "*[id=\"rbunxcgi\"] > fieldset > div:nth-child(3) > div:nth-child(2) > button"
				var cleanedUp = target.Substring(3);
				cleanedUp = cleanedUp.Replace("@", "");
				var parts = cleanedUp.Split('/');
				Regex arrayReplacer = new Regex(@"\[(\d+)\]");
				for (int i = 0; i < parts.Length; i++)
				{
					string part = parts[i];

					var match = arrayReplacer.Match(part);
					if (match.Success)
					{
						int idx = Convert.ToInt32(match.Groups[1].Value) + 1;
						parts[i] = part.Replace(match.Groups[0].Value, $":nth-child({idx})");
					}
				}
				return string.Join(" > ", parts);
			}
			else
			{
				var parts = target.Split("=");
				switch (parts[0])
				{

					case "link":
						{
							// Find the ID for our named link, or generate one if none found.
							var jsCode = $@"() => {{ 
const selectors = Array.from(document.querySelectorAll('a')); 
const res = selectors.find( t=> t.innerText.trim()==='{parts[1]}');
if (!res.id) {{
    res.id = ""__unique"" + new Date().getTime() + ""_id__""
}}
return ('#' + res.id)
}}";
							var selector = await page.EvaluateFunctionAsync<string>(jsCode);
							return selector;
						}
					case "id":
						return $"#{parts[1]}";
				}
			}

			return "";
		}

		/// <summary>
		/// Enter value as text into an input box as specified by target
		/// </summary>
		/// <param name="page"></param>
		/// <param name="target"></param>
		/// <param name="value"></param>
		/// <returns></returns>
		async Task EnterText(string target, string value)
		{
			string selector = await GetSelector(target);
			var jsCode = $@"
_item = document.querySelector(""{selector}"");
_item.value = ""{value}""
";
			await page.EvaluateExpressionAsync(jsCode);
		}

		///////////////////////////////////////////////////////////////////////////////////////////////

		async Task<OutputTransaction[]> GetRawTransactions(string selector)
		{
			string jsCmd = $@"
() => {{
    var isValidDate = (s) => {{
      var bits = s.split(' ');
      var d = new Date(s);
      return d.getFullYear() == bits[2] && d.toLocaleDateString(""en-US"", {{month: ""short"" }}) == bits[1];
    }}

    tds = document.querySelectorAll(`{selector}`);
    vtd = [];
    tds.forEach(t => {{ 
        if (isValidDate(t.innerText.trim())) vtd.push(t) 
    }});

    txs = [];
    vtd.forEach(td => {{
        tr = td.parentElement;
        if (tr.children[1] == td) {{
            tx = {{ 
                date: tr.children[1].innerText.trim(),
                desc: tr.children[2].innerText.trim(),
                withdrawal: tr.children[3].innerText.trim(),
                deposit: tr.children[4].innerText.trim(),
                balance: tr.children[5].innerText.trim()
            }};
            txs.push(tx)
        }}
    }});
    return txs;
}}
";
			var rawResults = await page.EvaluateFunctionAsync<OutputTransaction[]>(jsCmd);
			return rawResults;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="input"></param>
		/// <returns></returns>
		uint ParseMoney(string input)
		{
			if (input.Length > 0)
			{
				return (uint)(100 * Convert.ToDecimal(input));
			}
			return 0;
		}

		List<Transaction> ConvertToPublicTransactions(OutputTransaction[] rawResults)
		{
			List<Transaction> results = new List<Transaction>();
			const uint InvalidVal = uint.MaxValue;
			uint balance = InvalidVal;
			foreach (var result in rawResults)
			{
				DateTime date = DateTime.Parse(result.Date);
				uint withdrawal = ParseMoney(result.Withdrawal);
				uint deposit = ParseMoney(result.Deposit);
				uint newBalance = ParseMoney(result.Balance);

				if (newBalance != 0)
				{
					if (balance == InvalidVal)
					{
						balance = newBalance;
					}
					else if (newBalance != balance)
					{
						throw new Exception("HIDEOUS EXTANT FAILURE OF ALL THAT IS GOOD!  MAHT IS BROKEN!!! RUN SCREAAAMMAAAIINNGG");
					}
				}

				var tx = new Transaction()
				{
					Date = date,
					Desc = result.Desc,
					Withdrawal = withdrawal,
					Deposit = deposit,
					Balance = balance
				};
				Console.WriteLine(tx);
				results.Add(tx);

				// Remember we are going back in time with each entry
				balance = balance + withdrawal - deposit;
			}

			return results;
		}

		///////////////////////////////////////////////////////////////////////////////////////////////

		/// <summary>
		/// Initialize app before usage
		/// </summary>
		/// <param name="appdir"></param>
		/// <returns></returns>
		async Task Initialize(string appdir)
		{
			LoadCommands(appdir);
			var browserpath = await DownloadChromium();

			var options = new LaunchOptions { Headless = true };
			browser = await Puppeteer.LaunchAsync(options);
			page = await browser.NewPageAsync();
		}

		private void LoadCommands(string appdir)
		{
			logger.LogInformation("Processing action script");
			var userInput = System.IO.File.ReadAllText(appdir + "LoginRBC.json");

			dynamic json = JsonConvert.DeserializeObject(userInput);
			commands = json.Commands;
			txPageData = commands[commands.Count - 1];
			commands.Remove(txPageData);

		}

		private async Task<string> DownloadChromium()
		{
			logger.LogInformation("Downloading chromium");
			var browserFetcher = Puppeteer.CreateBrowserFetcher(new BrowserFetcherOptions());
			browserFetcher.DownloadProgressChanged += PrintDownloadProgress;
			await browserFetcher.DownloadAsync(BrowserFetcher.DefaultRevision);
			return browserFetcher.GetExecutablePath(BrowserFetcher.DefaultRevision);
		}

		private long bytesDownloaded = 0;
		private const long bytesInterval = 500000;
		private void PrintDownloadProgress(object sender, DownloadProgressChangedEventArgs e)
		{
			if (e.BytesReceived > bytesDownloaded)
			{
				string progress = String.Format("Progress: {0}%", e.BytesReceived);
				logger.LogDebug(progress);
				bytesDownloaded = e.BytesReceived + bytesInterval;
			}
		}

		public class OutputTransaction
		{
			public string Date { get; set; }
			public string Desc { get; set; }
			public string Withdrawal { get; set; }
			public string Deposit { get; set; }
			public string Balance { get; set; }
			public override string ToString() => $"Date: {Date} \nDesc: {Desc}";
		}
	}
}
