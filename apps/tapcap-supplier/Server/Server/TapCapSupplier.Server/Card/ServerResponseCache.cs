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
		private string CachePath => string.Format("{0}/{1}.json", BasePath, "TODO");

		internal ServerResponseCache(string appFolder)
		{
			if (appFolder != null)
			{
				BasePath = appFolder + "/cache";
				LoadStaticResponses();
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

		private void LoadStaticResponses()
		{
			if (File.Exists(CachePath))
			{
				using (StreamReader sr = new StreamReader(CachePath))
				{
					var staticResponses = JsonConvert.DeserializeObject<StaticResponses>(sr.ReadToEnd());

					if (staticResponses.Responses.Count != staticResponses.ResponseParentIndex.Count ||
						staticResponses.Queries.Count != staticResponses.Responses.Count)
					{
						//logger.Error("Static Cache: Mismatched cache array lengths");
						return;
					}
					queries = staticResponses.Queries;
					responses = staticResponses.Responses;
					parentIndices = staticResponses.ResponseParentIndex;
					GpoPdol = staticResponses.GpoPdol;
					CryptoPdol = staticResponses.CryptoPdol;
				}
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
					sw.Write(JsonConvert.SerializeObject(CardStaticResponses()));
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
