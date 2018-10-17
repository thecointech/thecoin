﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using PCSC;
using PCSC.Iso7816;
using TheUtils;

namespace TapCapSupplier.Server.Card
{
	/// <summary>
	/// Base level class handles direct communication with the payment card
	/// </summary>
	public class EmvCardMessager : ICardMessager
	{
		private ILogger _logger;
		private ISCardContext Context;
		private IsoReader _reader;

		private IsoReader Reader
		{
			get
			{
				if (_reader == null)
				{
					var contextFactory = ContextFactory.Instance;
					Context = contextFactory.Establish(SCardScope.System);

					var readerNames = Context.GetReaders();
					if (NoReaderFound(readerNames))
					{
						Console.WriteLine("You need at least one reader in order to run this example.");
						Console.ReadKey();
						return null;
					}

					var name = ChooseReader(readerNames);
					if (name == null)
					{
						return null;
					}

					_reader = new IsoReader(
						context: Context,
						readerName: name,
						mode: SCardShareMode.Shared,
						protocol: SCardProtocol.Any,
						releaseContextOnDispose: false);

					_logger.LogTrace("Transaction Started: on {0} ", _reader.ReaderName);
				}
				return _reader;
			}
		}

		SCardProtocol ICardMessager.Protocol => Reader.ActiveProtocol;

		/// <summary>
		/// 
		/// </summary>
		public EmvCardMessager(ILogger logger)
		{
			_logger = logger;
		}

		/// <summary>
		/// Dispose of PCSC reader object
		/// </summary>
		public void Dispose()
		{
			if (_reader != null)
			{
				_logger.LogTrace("Disposing Reader");
				_reader?.Dispose();
			}
		}

		/// <summary>
		/// Send command to card, return response
		/// </summary>
		/// <param name="apdu"></param>
		/// <param name="command"></param>
		/// <returns></returns>
		public Response SendCommand(CommandApdu apdu, String command)
		{
			_logger.LogTrace("Sending Command {0}: {1}", command, BitConverter.ToString(apdu.ToArray()));

			var response = Reader.Transmit(apdu);

			_logger.LogTrace("SW1 SW2 = {0:X2} {1:X2}", response.SW1, response.SW2);

			if (!response.HasData)
			{
				_logger.LogError("No data. (Card does not understand \"{0}\")", command);
				return null;
			}
			else
			{
				var resp = response.GetData();
				var chars = System.Text.Encoding.UTF8.GetString(resp);
				_logger.LogTrace("Response: \n  {0}", BitConverter.ToString(resp));
			}
			return response;
		}

		/// <summary>
		/// Create an APDU compatible with the underlying card
		/// </summary>
		/// <param name="hasData"></param>
		/// <returns></returns>
		public CommandApdu InitApdu(bool hasData)
		{
			IsoCase commandCase = hasData ? IsoCase.Case4Short : IsoCase.Case2Short;

			return new CommandApdu(commandCase, Reader.ActiveProtocol);
		}

		/// <summary>
		/// Sends a command to the connected emv card and returns the response
		/// </summary>
		/// <param name="data">command to sendx</param>
		/// <param name="origin">debugging string to enable tracing calls</param>
		/// <returns></returns>
		public Response SendCommand(byte[] data, String origin)
		{
			// We could simply pass the data directly through by 
			// using the lower-level API, but it appears that the
			// reader/apdu combo provided by the PCSC library does
			// a bit of additional work on reading to ensure we
			// interface with the card correctly, so we route through it
			bool hasData = data.Length > 5;
			var apdu = InitApdu(hasData);
			apdu.CLA = data[0];
			apdu.Instruction = (InstructionCode)data[1];
			apdu.P1 = data[2];
			apdu.P2 = data[3];

			if (hasData)
			{
				// TODO!!! The skipped byte is the Lc byte.  This field
				// may actually be longer than 255 though, in which case
				// we may need multiple bytes
				byte dataLength = data[4];
				apdu.Data = data.Skip(5).Take(dataLength).ToArray();
			}

			// For validation, convert back to byte array, and check equality
			// We do allow for a differing final byte (if it's 0) because
			// the library reconstruction does not add this byte (but
			// everything still seems to work)

			var newArray = apdu.ToArray();
			var dataLen = data.Length;
			if (data.Last() == 0)
				dataLen = newArray.Length;
			if (!newArray.SequenceEqual(data.Take(dataLen)))
			{
				_logger.LogError("Reconstructing APDU Failed! \n  Orig={0}\n  Recon={1}", BitConverter.ToString(data), BitConverter.ToString(newArray));
				// TODO: return some sort of error message
			}
			return SendCommand(apdu, origin);
		}

		// Later, we might support multiple cards
		private static string ChooseReader(IList<string> readerNames)
		{
			if (readerNames.Count == 1)
				return readerNames[0];
			return null;
		}

		private static bool NoReaderFound(ICollection<string> readerNames)
		{
			return readerNames == null || readerNames.Count < 1;
		}
	}
}
