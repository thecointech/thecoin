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
		protected List<int> parentIndices = new List<int>();

		protected byte[] GpoPdol;
		protected byte[] CryptoPdol;

		protected int LastIndex = -1;

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

			var type = Processing.ReadApduType(query);
			// A crypto sig cannot be cached
			if (type == Processing.ApduType.CyrptoSig)
				return -1;

			// Has this already been cached?
			var index = FindQueryIndex(query);
			if (index >= 0)
				return index;

			// normalize query data so we can search it easily
			query = TrimQuery(query, type);

			// TODO: Is this the right place to store these arrays?  They are automatically
			// contained in the responses sent to the user.
			if (type == Processing.ApduType.Select2)
				GpoPdol = Processing.FindValue(response, new string[] { "6F", "A5", "9F38" });
			else if (type == Processing.ApduType.GetData && CryptoPdol == null)
				CryptoPdol = Processing.FindValue(response, new string[] { "70", "8C" });

			queries.Add(query);
			responses.Add(response);
			parentIndices.Add(LastIndex);

			LastIndex = responses.Count - 1;
			return LastIndex;
		}

		const byte DataLenIdx = 4;

		byte[] StripGPOQuery(byte[] query)
		{
			if (query[5] != 0x83 && query[6] != (query[DataLenIdx] - 2))
				throw new System.Exception("Assumption parsing GPO PDOL failed");
			return query.Take(7).ToArray();
		}


		byte[] TrimQuery(byte[] query, Processing.ApduType type)
		{
			if (type == Processing.ApduType.GPO)
			{
				// We cannot store the actual tx-specific data submitted to with the GPO
				return StripGPOQuery(query);
			}
			byte dataLen = query[DataLenIdx];
			int totalLen = dataLen + DataLenIdx + 1;
			if (query.Length == totalLen + 1 && query[totalLen] == 0)
				return query.Take(totalLen).ToArray();
			return query;
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
			var type = Processing.ReadApduType(query);
			if (type == Processing.ApduType.CyrptoSig)
				return -1;

			query = TrimQuery(query, type);
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
