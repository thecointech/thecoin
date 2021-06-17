using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Models;

namespace TapCapSupplier.Card
{
	internal class ServerResponseCache : TheUtils.StaticResponseCache
	{
		private string BasePath;
		private string CardName;
		private string CachePath => string.Format("{0}/{1}.json", BasePath, CardName);

		internal ServerResponseCache(string appFolder, string cardName)
		{
			CardName = cardName;
			if (appFolder != null)
			{
				BasePath = appFolder + "/cache";
			}
		}

		internal StaticResponses CardStaticResponses()
		{
			return new StaticResponses()
			{
				Queries = queries,
				Responses = responses,
				ResponseParentIndex = parentIndices,
				GpoPdol = this.GpoPdol,
				CryptoPdol = this.CryptoPdol
			};
		}

		private byte[] MaybeGetVal(JObject cacheJson, string query)
		{
			if (cacheJson.ContainsKey(query))
			{
				var gpo = cacheJson.GetValue(query).ToString();
				return TheUtils.ByteConvert.FromString(gpo);
			}
			return null;
		}

		public void LoadStaticResponses()
		{
			try
			{
				if (File.Exists(CachePath))
				{
					var rawJson = File.ReadAllText(CachePath);
					JObject cacheJson = JObject.Parse(rawJson);

					IList<string> squeries = cacheJson.GetValue("Queries").ToObject<IList<string>>();
					IList<string> sresponses = cacheJson.GetValue("Responses").ToObject<IList<string>>();
					IList<int> indices = cacheJson.GetValue("ParentIndices").ToObject<IList<int>>();
					if (squeries.Count != indices.Count ||
						sresponses.Count != squeries.Count)
					{
						//logger.Error("Static Cache: Mismatched cache array lengths");
						return;
					}

					queries = squeries.Select((s) => TheUtils.ByteConvert.FromString(s)).ToList();
					responses = sresponses.Select((s) => TheUtils.ByteConvert.FromString(s)).ToList();
					parentIndices = indices.ToList();

					GpoPdol = MaybeGetVal(cacheJson,"Gpo");
					CryptoPdol = MaybeGetVal(cacheJson, "Crypto");
				}
			}
			catch (Exception /*e*/)
			{
				queries = new List<byte[]>();
				responses = new List<byte[]>();
				parentIndices = new List<int>();
				GpoPdol = null;
				CryptoPdol = null;
				throw;
			}
		}

		private void SaveResponses()
		{
			if (BasePath != null)
			{
				if (!Directory.Exists(BasePath))
					Directory.CreateDirectory(BasePath);

				using (StreamWriter sw = new StreamWriter(CachePath))
				{
					dynamic saveInfo = new System.Dynamic.ExpandoObject();
					saveInfo.Queries = queries.Select((ar) => BitConverter.ToString(ar)).ToArray();
					saveInfo.Responses = responses.Select((ar) => BitConverter.ToString(ar)).ToArray();
					saveInfo.ParentIndices = parentIndices;
					if (GpoPdol != null)
						saveInfo.Gpo = BitConverter.ToString(GpoPdol);
					if (CryptoPdol != null)
						saveInfo.Crypto = BitConverter.ToString(CryptoPdol);

					sw.Write(JsonConvert.SerializeObject(saveInfo));
				}
			}
		}

		/// <summary>
		/// Add the new query/response node as the child of the last node
		/// on the query tree.  Returns the index of the new node.
		/// </summary>
		/// <param name="query"></param>
		/// <param name="response"></param>
		/// <returns></returns>
		public override int AddNewStaticResponse(byte[] query, byte[] response)
		{
			var idx = base.AddNewStaticResponse(query, response);
			SaveResponses();
			return idx;
		}
	}
}
