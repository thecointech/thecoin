using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace TapCapSupplier.Server.Utils
{
	/// <summary>
	/// Class holding simple utility functinos
	/// </summary>
	public static class Utils
	{
		/// <summary>
		/// 
		/// </summary>
		/// <param name="hosting"></param>
		/// <returns></returns>
		public static string GetDataPath(IHostingEnvironment hosting)
		{
			if (hosting != null)
				return Path.Combine(hosting.ContentRootPath, "data");
			return null;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="hosting"></param>
		/// <param name="filename"></param>
		/// <returns></returns>
		public static string GetDataPath(IHostingEnvironment hosting, string filename)
		{
			return Path.Combine(hosting.ContentRootPath, "data", filename);
		}
	}
}
