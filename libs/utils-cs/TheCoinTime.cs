using System;
using System.Collections.Generic;
using System.Text;

namespace TheUtils
{
    public class TheCoinTime
    {
        private static readonly DateTime UnixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);


        /// <summary>
        /// The delay between the end of a market period and that
        /// period's data becoming our new prices markers.  This
        /// delay is necessary in order for us to query the market
        /// for the intervals and update our local DB
        /// </summary>
        public const int IntvDelay = 15;

        public static long Now()
        {
            return ToTimestamp(DateTime.UtcNow);
        }

        public static DateTime ToUTC(long timestamp)
        {
            return UnixEpoch + TimeSpan.FromMilliseconds(timestamp);
        }

		public static DateTime ToLocal(long timestamp)
		{
			return ToUTC(timestamp).ToLocalTime();
		}
		public static DateTime ToLocal(double timestamp) => ToLocal((long)timestamp);

		public static long ToTimestamp(DateTime dt)
        {
            // Round our timestamp to the nearest millisecond
            // however leave type as double as that is the unit
            // used by the rest of the system
            return (long)(dt - UnixEpoch).TotalMilliseconds;
        }

		
    }
}
