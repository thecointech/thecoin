using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Xamarin.Forms;

namespace TheApp.Converters
{
	public class ColorToSolidColorBrushConverter : IValueConverter
	{
	
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return new SolidColorBrush(Color.FromHex(value as string));
			//var color = value as Color;
			//return color ? new SolidColorBrush(color) : null;
			//return value is Color color ? new SolidColorBrush(color) : null;
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			var brush = value as SolidColorBrush;
			return brush?.Color;
		}
	}
}
