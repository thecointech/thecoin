using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// High-level interface to payment card
	/// </summary>
	public interface IEmvCard
	{
		/// <summary>
		/// 
		/// </summary>
		byte[] GpoPDOL { get; }
		/// <summary>
		///
		/// </summary>
		byte[] CryptoPDOL { get; }
		/// <summary>
		/// TODO
		/// </summary>
		string Name { get; }

		/// <summary>
		/// 
		/// </summary>
		StaticResponses StaticResponses { get; }

		/// <summary>
		/// 
		/// </summary>
		/// <returns></returns>
		byte[] GetSingleResponse(List<StaticResponse> staticResponse);


		/// <summary>
		/// Called by the system to generate a crypto signature
		/// that can be sent to a terminal to finish a transaction
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		byte[] GenerateCrypto(TapCapClientRequest request);
	}
}
