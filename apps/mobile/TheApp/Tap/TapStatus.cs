using System;
using System.Collections.Generic;
using System.Text;
using TapCapManager.Client.Model;
using TheUtils;

namespace TheApp.Tap
{
    internal class TapStatus
	{
		private TapCapQueryResponse _response;


		internal TapStatus(TapCapQueryResponse response)
		{
			_response = response;
			var (address, token) = Signing.GetSignerAndMessage<TapCapToken>(_response.Token);
			Token = token;
			SignedBy = address;
		}

		public ulong Balance => (ulong)_response.Balance.GetValueOrDefault(0);
		public TapCapToken Token;
		public string SignedBy;
	}
}
