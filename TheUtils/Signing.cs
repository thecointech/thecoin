using Nethereum.Signer;
using Nethereum.Web3.Accounts;
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
		//    var msgSigner = new MessageSigner();
		//    return msgSigner.HashAndSign(asBytes, from.PrivateKey);
		//}

		//// Get address of signing party from passed request
		//public static string GetSigner(TransactionRequest request)
		//{
		//    var signer = new MessageSigner();
		//    var asBytes = ToBytes(request.Request);
		//    var asHash = signer.Hash(asBytes.ToArray());

		//    return signer.EcRecover(asHash, request.RequestorSig);
		//}

		public static (string address, TMessage message) GetSignerAndMessage<TMessage>(dynamic signedMessage) where TMessage : new()
		{
			string signature = signedMessage.Signature;
			string messageStr = signedMessage.Message;

			var signer = new EthereumMessageSigner();
			var address = signer.EncodeUTF8AndEcRecover(messageStr, signature);
			var result = JsonConvert.DeserializeObject<TMessage>(messageStr);
			return (address, result);
		}

		public static TSigned MakeSignedMessage<TSigned>(object obj, Account account) where TSigned : new()
		{
			var message = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
			var signer = new EthereumMessageSigner();
			var signature = signer.EncodeUTF8AndSign(message, new EthECKey(account.PrivateKey));
			TSigned instance = (TSigned)Activator.CreateInstance(typeof(TSigned), message, signature);
			return instance;
		}
	}
}
