using System;
using System.Globalization;
using Xamarin.Forms;

namespace TheApp.Converters
{
    class CoinToHumanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return TheUtils.TheContract.ToHuman((ulong)value);
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return TheUtils.TheContract.ToCoin((double)value);
        }
    }
}
