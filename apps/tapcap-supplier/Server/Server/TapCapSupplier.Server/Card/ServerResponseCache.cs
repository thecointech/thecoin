using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.Card
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

		public void LoadStaticResponses()
		{
			try
			{
				if (File.Exists(CachePath))
				{
					using (StreamReader sr = new StreamReader(CachePath))
					{
						dynamic saveInfo = Newtonsoft.Json.Linq.JObject.Parse(sr.ReadToEnd());
						//dynamic saveInfo = JsonConvert.DeserializeObject();

						IList<string> squeries = saveInfo.Queries.ToObject<IList<string>>();
						IList<string> sresponses = saveInfo.Responses.ToObject<IList<string>>();
						IList<int?> indices = saveInfo.ParentIndices.ToObject<IList<int?>>();
						if (squeries.Count != indices.Count ||
							sresponses.Count != squeries.Count)
						{
							//logger.Error("Static Cache: Mismatched cache array lengths");
							return;
						}

						queries = squeries.Select((s) => TheUtils.ByteConvert.FromString(s)).ToList();
						responses = sresponses.Select((s) => TheUtils.ByteConvert.FromString(s)).ToList();
						parentIndices = indices.ToList();
						if (saveInfo.Gpo != null)
							GpoPdol = TheUtils.ByteConvert.FromString((string)saveInfo.Gpo);
						if (saveInfo.Crypto != null)
							CryptoPdol = TheUtils.ByteConvert.FromString((string)saveInfo.Crypto);
					}
				}
			}
			catch (Exception e)
			{
				queries = new List<byte[]>();
				responses = new List<byte[]>();
				parentIndices = new List<int?>();
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

		public override int AddNewStaticResponse(byte[] query, byte[] response)
		{
			var idx = base.AddNewStaticResponse(query, response);
			SaveResponses();
			return idx;
		}
	}
}
