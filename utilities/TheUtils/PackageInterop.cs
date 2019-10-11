using System;
using System.Linq;
using System.Reflection;

namespace TheUtils
{
	/// <summary>
	/// A static class for reflection type functions
	/// </summary>
	public static class PackageInterop
	{
		/// <summary>
		/// Utility class for converting between identical types in different packages
		/// This is required because although we share common definitions the swagger
		/// generators define differently named classes for identical types
		/// </summary>
		/// <param name="source">The source.</param>
		/// <returns>A copy of the source in format TDestType</returns>
		public static bool ConvertTo(object source, object destination) 
		{
			// If any this null throw an exception
			if (source == null || destination == null)
				throw new Exception("Source or/and Destination Objects are null");
			// Getting the Types of the objects
			Type typeDest = destination.GetType();
			Type typeSrc = source.GetType();
			// Collect all the valid properties to map
			// TODO: Enforce identical properties
			var sourceProperties = typeSrc.GetProperties();
			var destProperties = typeDest.GetProperties();

			if (sourceProperties.Length != typeDest.GetProperties().Length)
			{
				string message = $"Cannot cast from: {typeSrc.Name} to {typeDest.Name}: Different array lengths";
				throw new InvalidCastException(message);
			}

			foreach (var srcProp in sourceProperties)
			{
				if (srcProp.CanRead)
				{
					var destProp = typeDest.GetProperty(srcProp.Name);
					destProp.SetValue(destination, srcProp.GetValue(source, null), null);
				}
			}
			return true;
		}

		/// <summary>
		/// Slightly less verbose version of the above function
		/// </summary>
		/// <typeparam name="TDestType">The type to conver source to</typeparam>
		/// <param name="source"></param>
		/// <returns></returns>
		public static TDestType ConvertTo<TDestType>(object source)
		{
			var json = Newtonsoft.Json.JsonConvert.SerializeObject(source);
			return Newtonsoft.Json.JsonConvert.DeserializeObject<TDestType>(json);
		}
	}
}
