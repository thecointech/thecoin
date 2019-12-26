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

		public static string GetSigner(string message, string signature)
		{
			var signer = new EthereumMessageSigner();
			return signer.EncodeUTF8AndEcRecover(message, signature);
		}

		public static (string address, TMessage message) GetSignerAndMessage<TMessage>(dynamic signedMessage)
		{
			string signature = signedMessage.Signature;
			string messageStr = signedMessage.Message;

			var address = GetSigner(messageStr, signature);
			var result = JsonConvert.DeserializeObject<TMessage>(messageStr);
			return (address, result);
		}

		public static string GetSignature(string message, Account account)
		{
			var signer = new EthereumMessageSigner();
			return signer.EncodeUTF8AndSign(message, new EthECKey(account.PrivateKey));
		}

		public static (string message, string signature) GetMessageAndSignature(object obj, Account account)
		{
			string message = JsonConvert.SerializeObject(obj);
			string signature = GetSignature(message, account);
			return (message, signature);
		}

		public static TSigned SignMessage<TSigned>(object obj, Account account) where TSigned : new()
		{
			var (message, signature) = GetMessageAndSignature(obj, account);
			var signedMessage = new TSigned();
			Type signedType = signedMessage.GetType();

			var signatureProp = signedType.GetProperty("Signature");
			signatureProp.SetValue(signedMessage, signature, null);

			var messageProp = signedType.GetProperty("Message");
			messageProp.SetValue(signedMessage, message, null);

			return signedMessage;
		}



	}
}
