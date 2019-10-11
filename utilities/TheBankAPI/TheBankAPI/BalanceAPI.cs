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
	public class BalanceAPI : IDisposable
	{
		ILogger logger;
		private Browser browser;
		private Page page;

		private Task initTask;
		private Newtonsoft.Json.Linq.JArray commands;
		private dynamic txPageData;

		public BalanceAPI(ILogger logger, string appFolder)
		{
			this.logger = logger;
			initTask = Initialize(appFolder);
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
		public async Task<List<Data.Transaction>> GetLatestTransactions()
		{
			bool pageLoaded = await EnsurePageLoaded();
			if (!pageLoaded)
				return new List<Data.Transaction>();

			string txTarget = txPageData["Target"].ToString();
			var selector = await GetSelector(txTarget);
			await page.WaitForSelectorAsync(selector);
			var rawResults = await GetRawTransactions(selector);
			return ConvertToPublicTransactions(rawResults);
		}

		async Task<bool> EnsurePageLoaded()
		{
			await initTask;

			for (int i = 0; i < 5; i++)
			{
				try
				{
					logger.LogTrace("Attempting page load: " + i);
					if (page == null || page.Url == "about:blank")
					{
						logger.LogTrace("First-time load");
						if (await ReInitializePage())
						{
							logger.LogTrace("load successful");
							return true;
						}
					}
					else
					{
						// If we have a valid page, then
						// we can simply reload it and hope that
						// we are still logged in.  We test
						// login state via 
						var response = await page.ReloadAsync();
						// Check to see if the refreshed page is the
						// one we are looking for
						if (response != null && response.Ok && await VerifyStatementPage())
						{
							logger.LogTrace("Page refreshed successfully");
							return true;
						}

						// If not, then lets reload the page from scratch
						if (await ReInitializePage())
						{
							logger.LogTrace("Page Logged in successfully");
							return true;
						}
						logger.LogError("Could not fetch new items");
					}
				}
				catch (Exception err)
				{
					logger.LogError("Error loading page: {0}", err.Message);
				}
			}
			return false;
		}

		///////////////////////////////////////////////////////////////////////////////////////////////

		/// <summary>
		/// Does the page contain the information we are searcing for?
		/// </summary>
		/// <returns></returns>
		async Task<bool> VerifyStatementPage()
		{
			string target = txPageData["Target"].ToString();
			string selector = await GetSelector(target);
			var results = await page.QuerySelectorAllAsync(selector);
			return results.Length > 0;
		}

		async Task<bool> ReInitializePage()
		{
			var counter = 0;
			try
			{
				foreach (dynamic command in commands)
				{
					string action = command["Command"].ToString();
					string target = command["Target"].ToString();
					logger.LogDebug("Processing {0} - {1}", action, target);

					switch (action)
					{
						case "open":
							{
								await page.GoToAsync(target);
								break;
							}
						case "clickAndWait":
							{
								var navigateWait = page.WaitForNavigationAsync();
								string selector = await GetSelector(target);
								await page.ClickAsync(selector);
								await navigateWait;
								break;
							}
						case "type":
							{
								string value = command["Value"].ToString();
								await EnterText(target, value);
								break;
							}
						case "click":
							{
								string selector = await GetSelector(target);
								if (selector.EndsWith("button"))
								{
									// We must wait till we've navigated, and wait till
									// we've stopped navigating
									var navigateWait = page.WaitForNavigationAsync();
									var trafficWait = page.WaitForNavigationAsync(
										new NavigationOptions()
										{
											WaitUntil = new WaitUntilNavigation[]{
												WaitUntilNavigation.Networkidle0
											}
										});
									var clickAsync = page.ClickAsync(selector);
									Task.WaitAll(clickAsync, navigateWait, trafficWait);

									//var redirects = responseAsync.Result.Request.RedirectChain;
								}
								else
									await page.ClickAsync(selector);

								break;
							}
						case "select":
							{
								string selector = await GetSelector(target);
								await page.WaitForSelectorAsync(selector);
								break;
							}
					}
					counter++;
					logger.LogTrace("Completed action {0}", counter);
					await page.ScreenshotAsync($@"c:\temp\screenshot{counter}.png");
				}
				return true;
			}
			catch(Exception err)
			{
				logger.LogError("Exception: " + err.ToString());
			}
			return false;
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

			logger.LogDebug("BalanceAPI fetched {0} results, w/ balance {1}", rawResults.Length, (rawResults.Length > 0) ? rawResults[0].Balance : "none");
			return rawResults;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="input"></param>
		/// <returns></returns>
		int ParseMoney(string input)
		{
			if (input.Length > 0)
			{
				return (int)(100 * Convert.ToDecimal(input));
			}
			return 0;
		}

		List<Data.Transaction> ConvertToPublicTransactions(OutputTransaction[] rawResults)
		{
			List<Data.Transaction> results = new List<Data.Transaction>();
			const int InvalidVal = int.MinValue;
			int balance = InvalidVal;
			foreach (var result in rawResults)
			{
				DateTime date = DateTime.Parse(result.Date);
				int withdrawal = ParseMoney(result.Withdrawal);
				int deposit = ParseMoney(result.Deposit);
				int newBalance = ParseMoney(result.Balance);

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

				var tx = new Data.Transaction()
				{
					Date = date,
					Description = result.Desc,
					FiatChange = deposit - withdrawal,
					FiatBalance = balance
				};
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
		async Task Initialize(string baseFolder)
		{
			LoadCommands(baseFolder);
			var browserpath = await DownloadChromium(baseFolder);

			var options = new LaunchOptions {
				Headless = true,
				ExecutablePath = browserpath
			};
			browser = await Puppeteer.LaunchAsync(options);
			page = await browser.NewPageAsync();

			page.FrameNavigated += Page_FrameNavigated;
		}

		private void Page_FrameNavigated(object sender, FrameEventArgs e)
		{
			if (e.Frame.ParentFrame == null)
				logger.LogTrace("Navigated to: {0}", e.Frame.Url);
		}

		private void LoadCommands(string appdir)
		{
			logger.LogTrace("Processing action script");
			var userInput = System.IO.File.ReadAllText(appdir + @"\LoginRBC.json");

			dynamic json = JsonConvert.DeserializeObject(userInput);
			commands = json["Commands"];
			txPageData = commands[commands.Count - 1];
			commands.Remove(txPageData);

		}

		private async Task<string> DownloadChromium(string basePath)
		{
			string cachePath = System.IO.Path.Combine(basePath, "ChromiumCache");
			logger.LogInformation("Downloading chromium");
			var browserFetcher = Puppeteer.CreateBrowserFetcher(new BrowserFetcherOptions()
			{
				Path = cachePath
			});
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
				logger.LogTrace(progress);
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

		//////////////////////////////////////////////////////////////////////////////////////////////
		#region IDisposable Support
		private bool disposedValue = false; // To detect redundant calls

		protected virtual void Dispose(bool disposing)
		{
			if (!disposedValue)
			{
				if (disposing)
				{
					page.Dispose();
					browser.Dispose();
				}

				// TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
				// TODO: set large fields to null.

				disposedValue = true;
			}
		}

		// TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
		// ~BalanceAPI() {
		//   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
		//   Dispose(false);
		// }

		// This code added to correctly implement the disposable pattern.
		public void Dispose()
		{
			// Do not change this code. Put cleanup code in Dispose(bool disposing) above.
			Dispose(true);
			// TODO: uncomment the following line if the finalizer is overridden above.
			// GC.SuppressFinalize(this);
		}
		#endregion
	}
}
