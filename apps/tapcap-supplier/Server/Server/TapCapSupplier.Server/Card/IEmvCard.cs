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
		/// Get the data set of constant messages
		/// </summary>
		/// <returns></returns>
		StaticResponses CardStaticResponses();

		/// <summary>
		/// Called by the system to generate a crypto signature
		/// that can be sent to a terminal to finish a transaction
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		byte[] GenerateCrypto(TapCapRequest request);
	}
}
