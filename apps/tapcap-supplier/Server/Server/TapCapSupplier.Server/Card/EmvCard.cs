using BerTlv;
using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;
using TheUtils;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Implements interface to talk to a local card
	/// </summary>
	public class EmvCard : IEmvCard, IDisposable
	{

		public EmvCard()
		{
			lock(__CardLock)
			{
				card = new EmvCardMessager();
				QueryStaticResponses();
			}
		}

		/// <summary>
		/// 
		/// </summary>
		/// <returns></returns>
		StaticResponses CardStaticResponses()
		{
			return new StaticResponses()
			{
				Responses = __staticResponses,
				GpoData = 
			};
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		public byte[] GenerateCrypto(TapCapRequest request)
		{
			lock(__CardLock)
			{
				var appData = WarmUpCard();
				var gpoQuery = Processing.BuildGPOQuery(appData, card, request.Pdol);

			}
		}

		///

		private void QueryStaticResponses()
		{
			__staticResponses = new List<StaticResponse>();
			GPOPdol = null;
			CryptPdol = null;

			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = QueryAndStore(cmdInitialize, "Select File");

			var selectApp = Processing.BuildSelectApp(fileData, card);
			var appData = QueryAndStore(selectApp, "Select App");

			GPOPdol = Processing.FindValue(appData.GetData(), new string[] { "6F", "A5", "9F38" });
			var gpoQuery = Processing.BuildGPOQuery(appData, card);
			var gpoData = QueryAndStore(gpoQuery, "Query GPO");

			var fileList = Processing.ParseAddresses(gpoData);
			foreach (var file in fileList)
			{
				for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
				{
					var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, card);
					var recordData = QueryAndStore(recordQuery, "Query Record: " + recordNum);

					if (CryptPdol == null)
						CryptPdol = Processing.FindValue(recordData.GetData(), new string[] { "70", "8C" });
				}
			}
		}

		private Response QueryAndStore(CommandApdu query, string name)
		{
			Response queryResponse = card.SendCommand(query, name);
			byte[] data = queryResponse.GetData();

			__staticResponses.Add(new StaticResponse()
			{
				Query = query.Data,
				Response = data
			});
			return queryResponse;
		}

		// Return the command we warmed up to
		private Response WarmUpCard()
		{
			var cmdInitialize = Processing.BuildInitialize(card);
			var fileData = card.SendCommand(cmdInitialize, "Init Tx");
			var selectApp = Processing.BuildSelectApp(fileData, card);
			return card.SendCommand(selectApp, "Select App");
		}


		/// <summary>
		/// 
		/// </summary>
		public void Dispose()
		{
			card.Dispose();
		}

		//////////////////////////////////////////////////////////

		// Only one tx may occur at a time
		private static object __CardLock = new object();

		private EmvCardMessager card;
		private List<StaticResponse> __staticResponses;
		private byte[] GPOPdol;
		private byte[] CryptPdol;
	}
}
