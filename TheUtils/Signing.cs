using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TheUtils
{
    public static class Signing
    {
		//public static byte[] ToBytes(CurrencyTransaction request)
		//{
		//    // Convert transaction to binary
		//    byte[] buff = new byte[2048];
		//    var writableStream = new Google.Protobuf.CodedOutputStream(buff);
		//    request.WriteTo(writableStream);
		//    var trimmedBuff = buff.Take((int)writableStream.Position);
		//    return trimmedBuff.ToArray();
		//}

		//// Create signature for passed transaction
		//public static string SignTransaction(CurrencyTransaction request, Nethereum.Web3.Accounts.Account from)
		//{
		//    var asBytes = ToBytes(request);
		//    var msgSigner = new Nethereum.Signer.MessageSigner();
		//    return msgSigner.HashAndSign(asBytes, from.PrivateKey);
		//}

		//// Get address of signing party from passed request
		//public static string GetSigner(TransactionRequest request)
		//{
		//    var signer = new Nethereum.Signer.MessageSigner();
		//    var asBytes = ToBytes(request.Request);
		//    var asHash = signer.Hash(asBytes.ToArray());

		//    return signer.EcRecover(asHash, request.RequestorSig);
		//}

		public static (string address, TMessage message) GetSigned<TMessage>(dynamic signedMessage) where TMessage : new()
		{
			string signature = signedMessage.Signature;
			string messageStr = signedMessage.Message;

			var signer = new Nethereum.Signer.EthereumMessageSigner();
			var address = signer.EncodeUTF8AndEcRecover(messageStr, signature);
			var result = JsonConvert.DeserializeObject<TMessage>(messageStr);
			return (address, result);
		}
	}
}
