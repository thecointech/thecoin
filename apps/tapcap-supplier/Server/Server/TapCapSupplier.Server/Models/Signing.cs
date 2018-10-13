using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TapCapSupplier.Server.Models
{
	/// <summary>
	/// 
	/// </summary>
	public static class Signing
	{
		/// <summary>
		/// 
		/// </summary>
		/// <typeparam name="TSigned"></typeparam>
		/// <param name="message"></param>
		/// <returns></returns>
		public static (string address, TSigned message) GetSigned<TSigned>(SignedMessage message) where TSigned : new()
		{
			return ("", new TSigned());
		}
	}
}
