using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TheUtils
{
    public static class PDOL
    {
        public struct PDOLItem
        {
            //public string Description; // not used
            public PDOLTags Tag;
            public ushort DataLength;
            public byte[] Data;
        }

        public enum PDOLTags
        {
            LocalDate = 0x9A, //"Local date that the transaction was authorised",
            PinData = 0x99, // Data entered by the cardholder for the purpose of the PIN verification",
            AccountType = 0x5F57, // "Indicates the type of account selected on the terminal",
            AcquirerUniqueId = 0x9F01, //Uniquely identifies the acquirer within each payment system",
            AmountBinary = 0x81, // "Amount, Authorised (Binary)",
            AmountNumeric = 0x9F02, //"Amount, Authorized (Numeric)",
            AmountOtherBinary = 0x9F04, 
            AmountOtherNumberic = 0x9F03,
            AmountInRefCurrency = 0x9F3A, // "Authorised amount expressed in the reference currency",
            TerminalCountryCode = 0x9F1A,
            TerminalVerificationResults = 0x95,
            TransactionCurrencyCode = 0x5F2A,
            TransactionCurrencyExp = 0x5F36,
            TranscationDate = 0x9A,
            TranscationType = 0x9C,
            UnpredicatbleNumber = 0x9F37,
            DataAuthCode = 0x9F45,
            ICCDynamicNumber = 0x9F4C,
            CVMResults = 0x9F34,

            ConsecutiveTransactionCounterUpperLimit = 0x9F59, // Terminal Transaction Information
            ApplicationProgramId = 0x9F5A, // Custom data: For interac this is terminal transaction type
            MerchantTypeIndicator = 0x9F58,

            // Visa specific?
            TerminalTransactionQualifiers = 0x9F66,
        }

        public static List<PDOLItem> ParsePDOLItems(IEnumerable<byte> data)
        {
            // its possible that the card does not request a PDOL
            List<PDOLItem> items = new List<PDOLItem>();
            if (data == null)
                return items;

     
            var byteEnum = data.GetEnumerator();
            int tag = 0;
            while (byteEnum.MoveNext())
            {
                if (tag != 0)
                    tag = tag << 8;
                if (tag > 0xFFFF)
                {
                    throw new FormatException("Invalid Input data: " + tag);
                }
                tag += byteEnum.Current;

                if (Enum.IsDefined(typeof(PDOLTags), tag))
                {
                    // Tag is a match
                    byteEnum.MoveNext();

                    var newItem = new PDOLItem()
                    {
                        Tag = (PDOLTags)tag,
                        DataLength = byteEnum.Current,
                        Data = new byte[byteEnum.Current]
                    };
                    items.Add(newItem);
                    tag = 0;
                }
            }
            return items;
        }

		private static bool ParsePDOLData(IEnumerator<byte> dataEnum, List<PDOLItem> items)
		{
			foreach (var pdol in items)
			{
				for (var i = 0; i < pdol.DataLength; i++)
				{
					if (!dataEnum.MoveNext())
						return false;
					pdol.Data[i] = dataEnum.Current;
				}
			}
			return true;
		}

        // Parse the given data into the PDOL list
        public static bool ParseIntoGpoPDOL(IEnumerable<byte> data, List<PDOLItem> items)
        {
            var dataEnum = data.GetEnumerator();

            // Skip the first 2 items
            // They are the 0x83/ Data Len bytes
            dataEnum.MoveNext();
            dataEnum.MoveNext();

			return ParsePDOLData(dataEnum, items);
		}

		// Parse the given data into the PDOL list
		public static bool ParseIntoCryptoPDOL(IEnumerable<byte> data, List<PDOLItem> items)
		{
			var dataEnum = data.GetEnumerator();
			return ParsePDOLData(dataEnum, items);
		}

		// Given PDOL list, return currency amount in cents
		public static ulong GetAmount(List<PDOLItem> pdolItems)
        {
            foreach (var item in pdolItems)
            {
                if (item.Tag == PDOLTags.AmountNumeric)
                {
                    ulong returnValue = 0;
                    ulong exp = 1;
                    // The data is stored in base10, 4 bits per number
                    for (int i = item.DataLength - 1; i >= 0; i--)
                    {
                        // NOTE: I strongly suspect this is the wrong method,
                        // but it matches DummyData so use it for now
                        //returnValue += exp * (ulong)item.Data[i];
                        //exp *= 100;
                        returnValue += exp * (ulong)(item.Data[i] & 0x0F);
                        exp *= 10;
                        returnValue += exp * (ulong)(item.Data[i] >> 4);
                        exp *= 10;
                    }
                    return returnValue;
                }
            }
            return 0;
        }

        public static byte[] GenerateCDOL(List<PDOLItem> cdolParsed)
        {
            List<byte> results = new List<byte>();
            foreach (var pdol in cdolParsed)
            {
                results = results.Concat(pdol.Data).ToList();
            }
            return results.ToArray();
        }

        public static byte[] GeneratePDOL(List<PDOLItem> pdolParsed)
        {
            List<byte> results = new List<byte>();
            foreach (var pdol in pdolParsed)
            {
                results = results.Concat(pdol.Data).ToList();
            }
            var data = results.ToArray();
            var header = new byte[] { 0x83, (byte)data.Length };
            return header.Concat(data).ToArray(); 
        }

        public static void FillWithDummyData(List<PDOLItem> pdolParsed, ulong currencyAmount = 1379) // Default currency amount is $13.79
        {
            foreach (var pdol in pdolParsed)
            {
                switch(pdol.Tag)
                {
                    // This amount should be $129.67
                    case PDOLTags.AmountNumeric:
                        var asString = currencyAmount.ToString();
                        var asBytes = asString.Select(c => (byte)(c - '0')).ToArray();
                        int byteOffset = 12 - asBytes.Length;
                        for (int i = byteOffset; i < 12; i++)
                        {
                            // First, get the byte val
                            var byteVal = (byte)asBytes[i - byteOffset];
                            // next, offset into either the 1st or 2nd 4 bits
                            if (i % 2 == 0) byteVal *= 0x10;
                            // Last, add it into the byte array
                            pdol.Data[i / 2] += byteVal;
                        }
                        break;
                    case PDOLTags.TerminalCountryCode:
                        pdol.Data[0] = 0x01;
                        pdol.Data[1] = 0x24;
                        break;
                    case PDOLTags.TransactionCurrencyCode:
                        pdol.Data[0] = 0x01;
                        pdol.Data[1] = 0x24;
                        break;
                    case PDOLTags.UnpredicatbleNumber:
                        pdol.Data[0] = 0x82;
                        pdol.Data[1] = 0x3D;
                        pdol.Data[2] = 0xDE;
                        pdol.Data[3] = 0x7A;
                        break;
                    case PDOLTags.TranscationDate: // march 20, 2018
                        pdol.Data[0] = 0x18;
                        pdol.Data[1] = 0x03;
                        pdol.Data[2] = 0x20;
                        break;
                    case PDOLTags.CVMResults:
                        pdol.Data[0] = 0x3F;
                        pdol.Data[1] = 0x00;
                        pdol.Data[2] = 0x02;
                        break;
                    case PDOLTags.TerminalTransactionQualifiers:
                        // Value taken from tbelleng code
                        pdol.Data[0] = 0x86;
                        pdol.Data[1] = 0x00;
                        pdol.Data[2] = 0x40;
                        pdol.Data[3] = 0x00;
                        break;

                    case PDOLTags.ConsecutiveTransactionCounterUpperLimit:
                        pdol.Data[0] = 0xC0;
                        pdol.Data[1] = 0x80;
                        pdol.Data[2] = 0x00;
                        break;
                    case PDOLTags.MerchantTypeIndicator:
                        pdol.Data[0] = 0x01;
                        break;
                }
            }
        }

		public static byte[] GenerateDummyData(byte[] pdol)
		{
			var parsed = PDOL.ParsePDOLItems(pdol);
			FillWithDummyData(parsed, 100);
			return GeneratePDOL(parsed);
		}
    }
}
