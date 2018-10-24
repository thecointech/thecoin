﻿using NLog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Model;
using TheApp.TheCoin;
using TheUtils;

namespace TheApp.Tap
{
	public class TransactionProcessor
	{
		private ITransactionApi TapSupplier;
		private StaticResponses StaticResponses;
		private UserAccount UserAccount;

		private Logger logger = LogManager.GetCurrentClassLogger();

		private Task __initializeTask;

		public TransactionProcessor(UserAccount userAccount, ITransactionApi supplier)
		{
			UserAccount = userAccount;
			TapSupplier = supplier;
			__initializeTask = InitializeStaticResponses();
		}

		internal async Task InitializeStaticResponses()
		{
			await UserAccount.MakeReady();
			var (m, s) = Signing.GetMessageAndSignature(UserAccount.Token, UserAccount.TheAccount);
			var supplierResponses = await TapSupplier.GetStaticAsync(new SignedMessage(m, s));
			StaticResponses = supplierResponses;
		}

		// This must be called before this class can be used
		internal Task MakeReady()
		{
			return __initializeTask;
		}

		internal byte[] GetResponse(byte[] query)
		{

			foreach (var response in StaticResponses.Responses)
			{
				if (query == response.Query)
					return response.Response;
			}

			// Else, if this is a purchase PDOL, then query server
			return null;
		}

		internal async Task<bool> TryTestTx()
		{
			try
			{
				var gpoData = StaticResponses.GpoPdol;
				var cryptData = StaticResponses.CryptoPdol;

				// Normally this would get sent back to the client to be filled by the terminal
				var gpoParsed = PDOL.ParsePDOLItems(gpoData);
				PDOL.FillWithDummyData(gpoParsed);

				var cryptParsed = PDOL.ParsePDOLItems(cryptData);
				PDOL.FillWithDummyData(cryptParsed);

				var timestamp = TheCoinTime.Now();
				var token = new SignedMessage(UserAccount.Token.Message, UserAccount.Token.Signature);
				TapCapClientRequest request = new TapCapClientRequest(timestamp, PDOL.GeneratePDOL(gpoParsed), PDOL.GenerateCDOL(cryptParsed), token);

				var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
				var signedMessage = new SignedMessage(m, s);
				//var tapCap = TapSupplier.RequestTapCap(signedMessage);
				var nothing = await TapSupplier.GetStaticAsync(token);

				logger.Info("Results {0}", nothing);
				return true;
			}
			catch (Exception e)
			{
				logger.Error(e, "Test Tx");
			}
			return false;
		}
	}
}
