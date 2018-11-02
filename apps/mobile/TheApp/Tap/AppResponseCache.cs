using Newtonsoft.Json;
using NLog;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TapCapSupplier.Client.Model;
using TheUtils;

namespace TheApp.Tap
{
	/// <summary>
	/// Basic class just manages searching StaticResponses for saved responses to queries
	/// </summary>
	public class AppResponseCache : StaticResponseCache
	{
		/// <summary>
		/// 
		/// </summary>
		public AppResponseCache()
		{
		}

		public AppResponseCache(StaticResponses staticResponses)
		{
			queries = staticResponses.Queries;
			responses = staticResponses.Responses;
			parentIndices = staticResponses.ResponseParentIndex;
			GpoPdol = staticResponses.GpoPdol;
			CryptoPdol = staticResponses.CryptoPdol;
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

		internal int ParentIndex => base.LastIndex;
	}
}
