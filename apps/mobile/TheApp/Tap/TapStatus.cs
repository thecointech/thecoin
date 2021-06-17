//using System;
//using System.Collections.Generic;
//using System.Text;
//using TapCapManager.Client.Model;
//using TheUtils;

//namespace TheApp.Tap
//{
//    public class TapStatus
//	{
//		private TapCapQueryResponse _response;

//		public TapStatus(TapCapQueryResponse response)
//		{
//			_response = response;
//			var (address, token) = Signing.GetSignerAndMessage<TapCapToken>(_response.Token);
//			Token = token;
//			SignedBy = address;
//		}

//		public SignedMessage SignedToken => _response.Token;
//		public ulong Balance => (ulong)_response.Balance.GetValueOrDefault(0);
//		public TapCapToken Token;
//		public string SignedBy;
//	}
//}
