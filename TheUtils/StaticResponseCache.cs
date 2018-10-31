using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace TheUtils
{
	/// <summary>
	/// Basic class just manages searching StaticResponses for saved responses to queries
	/// </summary>
	public class StaticResponseCache
	{
		protected List<byte[]> queries = new List<byte[]>();
		protected List<byte[]> responses = new List<byte[]>();
		protected List<int?> parentIndices = new List<int?>();

		protected byte[] GpoPdol;
		protected byte[] CryptoPdol;

		private int LastIndex = -1;

		/// <summary>
		/// 
		/// </summary>
		public StaticResponseCache()
		{
		}

		public void ResetTx()
		{
			LastIndex = -1;
		}

		public byte[] GetResponse(byte[] query)
		{
			var index = FindQueryIndex(query);
			if (index >= 0)
			{
				LastIndex = index;
				return responses[index];
			}
			return null;
		}
		
		public virtual int AddNewStaticResponse(byte[] query, byte[] response)
		{
			if (queries.Count != responses.Count || queries.Count != parentIndices.Count)
				throw new System.Exception("Invalid cache array lengths");

			var index = FindQueryIndex(query);
			if (index >= 0)
				return index;

			switch (Processing.ReadApduType(query))
			{
				case Processing.ApduType.Select2:
					GpoPdol = Processing.FindValue(response, new string[] { "6F", "A5", "9F38" });
					break;
				case Processing.ApduType.GPO:
					// We cannot store the actual data submitted to with the GPO
					query = StripGPOQuery(query);
					break;
				case Processing.ApduType.GetData:
					if (CryptoPdol == null)
						CryptoPdol = Processing.FindValue(response, new string[] { "70", "8C" });
					break;
				case Processing.ApduType.CyrptoSig:
					// A crypto sig cannot be cached
					return -1;
			}

			queries.Add(query);
			responses.Add(response);
			parentIndices.Add(LastIndex);

			LastIndex = responses.Count - 1;
			return LastIndex;
		}

		byte[] StripGPOQuery(byte[] query)
		{
			if (query[5] != 0x83 && query[6] != (query[4] - 2))
				throw new System.Exception("Assumption parsing GPO PDOL failed");
			return query.Take(7).ToArray();
		}

		bool ByteArrayCompare(byte[] a1, byte[] a2)
		{
			if (a1.Length != a2.Length)
				return false;

			for (int i = 0; i < a1.Length; i++)
				if (a1[i] != a2[i])
					return false;

			return true;
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
			for (int i = 0; i < queries.Count; i++)
			{
				if (parentIndices[i] == LastIndex)
				{
					if (ByteArrayCompare(query, queries[i]))
						return i;
				}
			}

			return -1;
		}
	}
}
