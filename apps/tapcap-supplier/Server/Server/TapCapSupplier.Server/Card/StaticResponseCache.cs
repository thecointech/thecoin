using Newtonsoft.Json;
using NLog;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TapCapSupplier.Server.Models;
using TheUtils;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Basic class just manages searching StaticResponses for saved responses to queries
	/// </summary>
	public class StaticResponseCache
	{
		private Logger logger = LogManager.GetCurrentClassLogger();

		private StaticResponses responses = new StaticResponses();
		private int LastIndex = -1;
		private string CachePath => string.Format("./cache/{0}.json", "TODO");

		/// <summary>
		/// 
		/// </summary>
		public StaticResponseCache()
		{
			//LoadStaticResponses();
		}

		internal StaticResponses CardStaticResponses()
		{
			return responses;
		}

		internal void ResetTx()
		{
			LastIndex = -1;
		}

		//internal StaticResponse CardStaticSingleResponse(List<StaticResponse> messageList)
		//{

		//	// For a single response, we start a new tx and iterate
		//	// through the passed list.  We send each query and test
		//	// the response to see if it's valid.  The final message
		//	// will have no existing response, and we we take the generated
		//	// response from the EMV card and return it to the user.
		//	var parentIndex = -1;
		//	foreach (var pair in messageList)
		//	{
		//		var query = pair.Query;
		//		var response = Card.SendCommand(query);
		//		if (pair.Response.Length == 0)
		//		{
		//			// if no response recorded already - cache this
		//			// query/response and return it
		//			return AddNewStaticResponse(query, response, parentIndex);
		//		}
		//		else
		//		{
		//			// Validate the response is the same as original
		//			// and as our cached version
		//			var index = FindQueryIndex(parentIndex, query);
		//			if (index < 0)
		//			{
		//				// TODO
		//				_logger.LogError("MisMatching thingies");
		//				return null;
		//			}

		//			// first, validate that response is same as cache
		//			if (!response.SequenceEqual(responses.Responses[index].Response))
		//			{
		//				// TODO
		//				_logger.LogError("MisMatching thingies");
		//				return null;
		//			}

		//			// Next, validate that its the same as clients expected response
		//			if (!response.SequenceEqual(pair.Response))
		//			{
		//				// TODO
		//				_logger.LogError("MisMatching thingies");
		//				return null;
		//			}

		//			// all good, continue
		//			parentIndex = index;
		//		}
		//	}

		//	_logger.LogError("Did not find query to cache & return?");
		//	return null;
		//}


		byte[] StripGPOQuery(byte[] query)
		{
			return query.Take(5).ToArray();
		}

		private int FindQueryIndex(byte[] query)
		{
			switch (Processing.ReadApduType(query))
			{
				case Processing.ApduType.GPO:
					query = StripGPOQuery(query);
					break;
				case Processing.ApduType.CyrptoSig:
					return -1;
			}

			// Assuming the last query had index of LastIndex, whats the current cache
			for (int i = 0; i < responses.Responses.Count; i++)
			{
				if (responses.ResponseParentIndex[i] == LastIndex)
				{
					if (responses.Responses[i].Query == query)
					{
						return i;
					}
				}
			}

			return -1;
		}

		internal byte[] GetResponse(byte[] query)
		{
			var index = FindQueryIndex(query);
			if (index >= 0)
			{
				LastIndex = index;
				return responses.Responses[index].Response;
			}
			LastIndex = -1;
			return null;
		}

		private void LoadStaticResponses()
		{
			if (File.Exists(CachePath))
			{
				using (StreamReader sr = new StreamReader(CachePath))
				{
					responses = JsonConvert.DeserializeObject<StaticResponses>(sr.ReadToEnd());

					if (responses.Responses.Count != responses.ResponseParentIndex.Count)
						logger.Error("Static Cache: Mismatached cache array lengths");
				}
			}
			else
			{
				responses = new StaticResponses()
				{
					ResponseParentIndex = new List<int?>(),
					Responses = new StaticResponseArray()
				};
			}
		}

		private void SaveResponses()
		{
			using (StreamWriter sw = new StreamWriter(CachePath))
			{
				sw.Write(JsonConvert.SerializeObject(responses));
			}
		}

		//private void BuildNewCache()
		//{
		//	responses = new StaticResponses()
		//	{
		//		Responses = new StaticResponseArray()
		//	};

		//	int parentIndex = 0;
		//	var cmdInitialize = Processing.BuildInitialize(Card);
		//	var fileData = QueryAndStore(cmdInitialize, parentIndex++);

		//	var selectApp = Processing.BuildSelectApp(fileData, Card);
		//	var appData = QueryAndStore(selectApp, parentIndex++);

		//	responses.GpoPdol = Processing.FindValue(appData, new string[] { "6F", "A5", "9F38" });
		//	var dummyData = PDOL.GenerateDummyData(responses.GpoPdol);
		//	var gpoQuery = Processing.BuildGPOQuery(Card, dummyData);
		//	var gpoData = QueryAndStore(gpoQuery, parentIndex++);

		//	var fileList = Processing.ParseAddresses(gpoData);
		//	foreach (var file in fileList)
		//	{
		//		for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
		//		{
		//			var recordQuery = Processing.BuildReadRecordApdu(file, recordNum, Card);
		//			var recordData = QueryAndStore(recordQuery, parentIndex++);

		//			if (responses.CryptoPdol == null)
		//				responses.CryptoPdol = Processing.FindValue(recordData, new string[] { "70", "8C" });
		//		}
		//	}
		//}


		//private void QueryStaticResponses()
		//{

		//}

		//private byte[] QueryAndStore(CommandApdu query, int parentIndex)
		//{
		//	byte[] response = Card.SendCommand(query);
		//	AddNewStaticResponse(query.ToArray(), response, parentIndex);
		//	return response;
		//}

		internal StaticResponse AddNewStaticResponse(byte[] query, byte[] response)
		{
			var index = FindQueryIndex(query);
			if (index >= 0)
				return responses.Responses[index];

			switch (Processing.ReadApduType(query))
			{
				case Processing.ApduType.Select2:
					responses.GpoPdol = Processing.FindValue(response, new string[] { "6F", "A5", "9F38" });
					break;
				case Processing.ApduType.GPO:
					// We cannot store the actual data submitted to with the GPO
					query = StripGPOQuery(query);
					break;
				case Processing.ApduType.GetData:
					if (responses.CryptoPdol == null)
						responses.CryptoPdol = Processing.FindValue(response, new string[] { "70", "8C" });
					break;
				case Processing.ApduType.CyrptoSig:
					// A crypto sig cannot be cached
					return null;
			}

			StaticResponse value = new StaticResponse()
			{
				Query = query,
				Response = response
			};

			responses.Responses.Add(value);
			responses.ResponseParentIndex.Add(LastIndex);
			if (responses.Responses.Count != responses.ResponseParentIndex.Count)
				logger.Error("Static Cache: Mismatched cache array lengths");

			LastIndex = responses.Responses.Count - 1;
			SaveResponses();
			return value;
		}

	}
}
