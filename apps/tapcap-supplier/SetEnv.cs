using System;
using System.IO;

namespace TapCapSupplier
{
	public static class SetEnv
	{
		public static void Load()
		{
			var config = Environment.GetEnvironmentVariable("CONFIG_NAME");
			// external
			var external = $"{Environment.GetEnvironmentVariable("THECOIN_ENVIRONMENTS")}/{config}.env";
			if (File.Exists(external))
			{
				LoadFile(external);
				return;
			}
			var inter = $"/src/TheCoin/environments/{config}.env";
			if (File.Exists(inter))
			{
				LoadFile(inter);
				return;
			}
			throw new Exception("Cannot load environment");
		}
		private static void LoadFile(string filePath)
		{
			foreach (var line in File.ReadAllLines(filePath))
			{
				var parts = line.Split(
					'=',
					StringSplitOptions.RemoveEmptyEntries);

				if (parts.Length != 2)
					continue;

				Environment.SetEnvironmentVariable(parts[0], parts[1]);
			}
		}
	}
}
