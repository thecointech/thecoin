using PCSC;
using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TheUtils;

namespace TheApp.Tap
{
    class TapTesting : ICardMessager
    {
		TransactionProcessor processor;

		private static NLog.Logger logger = NLog.LogManager.GetCurrentClassLogger();
		public SCardProtocol Protocol => SCardProtocol.T0;

		public TapTesting(TransactionProcessor processor)
		{
			this.processor = processor;
		}

		void TestBasic()
		{
			//var sr = processor.StaticResponses;
			//if (sr == null)
			//	return false;

			//try
			//{
			//	const ulong amt = 123;
			//	var gpoData = sr.GpoPdol;
			//	var cryptData = sr.CryptoPdol;

			//	// Normally this would get sent back to the client to be filled by the terminal
			//	var gpoParsed = PDOL.ParsePDOLItems(gpoData);
			//	PDOL.FillWithDummyData(gpoParsed, amt);

			//	var cryptParsed = PDOL.ParsePDOLItems(cryptData);
			//	PDOL.FillWithDummyData(cryptParsed, amt);

			//	var timestamp = TheCoinTime.Now();
			//	var mtoken = UserAccount.Status.SignedToken;
			//	var token = new SignedMessage(mtoken.Message, mtoken.Signature);
			//	TapCapClientRequest request = new TapCapClientRequest(timestamp, PDOL.GeneratePDOL(gpoParsed), PDOL.GenerateCDOL(cryptParsed), token);

			//	var (m, s) = Signing.GetMessageAndSignature(request, UserAccount.TheAccount);
			//	var signedMessage = new SignedMessage(m, s);
			//	var tapCap = await TapSupplier.RequestTapCapAsync(signedMessage);

			//	logger.Info("Results {0}", tapCap);

			//	if (tapCap != null)
			//	{
			//		Events.EventSystem.Publish(new Events.TxCompleted()
			//		{
			//			SignedResponse = tapCap
			//		});
			//	}
			//	return true;
			//}
			//catch (Exception e)
			//{
			//	logger.Error(e, "Test Tx");
			//}
			//return false;
		}

		public void TestFull()
		{
			ulong amt = (ulong)TheCoinTime.Now() % 100 + 5000;
			//using (var logBlock = NLog.LogManager.DisableLogging())
			{
				Task.Run(() =>
				{
					logger.Info("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ TESTING TX ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
					bool result = Testing.SendTestTransaction(amt, this);
					processor.Terminated("Testing Tx");
					logger.Info("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ TESTING TX ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
					return result;
				});
			}
		}

		public CommandApdu InitApdu(bool hasData)
		{
			return new CommandApdu(hasData ? IsoCase.Case4Short : IsoCase.Case2Short, Protocol);
		}

		public byte[] SendCommand(CommandApdu apdu)
		{
			return processor.ProcessCommand(apdu.ToArray()).GetAwaiter().GetResult();
		}

		public byte[] SendCommand(byte[] data)
		{
			return processor.ProcessCommand(data).GetAwaiter().GetResult();
		}
	}
}
