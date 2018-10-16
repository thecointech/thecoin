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
		public static TDestType ConvertTo<TDestType>(object source) where TDestType : new()
		{
			TDestType destination = new TDestType();
			// If any this null throw an exception
			if (source == null || destination == null)
				throw new Exception("Source or/and Destination Objects are null");
			// Getting the Types of the objects
			Type typeDest = destination.GetType();
			Type typeSrc = source.GetType();
			// Collect all the valid properties to map
			var results = from srcProp in typeSrc.GetProperties()
						  let targetProperty = typeDest.GetProperty(srcProp.Name)
						  where srcProp.CanRead
						  && targetProperty != null
						  && (targetProperty.GetSetMethod(true) != null && !targetProperty.GetSetMethod(true).IsPrivate)
						  && (targetProperty.GetSetMethod().Attributes & MethodAttributes.Static) == 0
						  && targetProperty.PropertyType.IsAssignableFrom(srcProp.PropertyType)
						  select new { sourceProperty = srcProp, targetProperty = targetProperty };
			//map the properties
			foreach (var props in results)
			{
				props.targetProperty.SetValue(destination, props.sourceProperty.GetValue(source, null), null);
			}
			return destination;
		}
	}
}
