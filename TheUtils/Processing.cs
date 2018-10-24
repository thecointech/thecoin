using BerTlv;
using PCSC.Iso7816;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TheUtils
{
    public struct RecordAddress
    {
        public int SFI;
        public byte FromRecord;
        public byte ToRecord;
        public int OfflineAddress;
    }

    public static class Processing
    {

		public static CommandApdu BuildInitialize(ICardMessager card)
		{
			var init = card.InitApdu(true);

			init.Instruction = InstructionCode.SelectFile;
			init.P1 = 0x04; // read the first file (I think?)
			init.Data = new byte[] { 0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31 };
			// new byte[] { 0x00, 0xA4, 0x04, 0x00, 0x0E, 0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00 };
			return init;

		}
		public static CommandApdu BuildSelectApp(Response fileResponse, ICardMessager card)
		{
			var tlvFileResponse = Tlv.ParseTlv(fileResponse.GetData());

			var selectApp = card.InitApdu(true);
			selectApp.Instruction = InstructionCode.SelectFile;
			selectApp.P1 = 0x04; // read the first file (I think?)
			selectApp.Data = FindValue(tlvFileResponse, new string[] { "6F", "A5", "BF0C", "61", "4F" });

			return selectApp;
		}

		public static CommandApdu BuildGPOQuery(ICardMessager card, byte[] data)
		{

			var gpo = card.InitApdu(true);
			gpo.CLA = 0x80;
			gpo.Instruction = (InstructionCode)0xA8;
			// GPO data supplied by terminal
			gpo.Data = data;
			return gpo;
		}

		public static CommandApdu BuildCryptSigQuery(ICardMessager card, byte[] cryptData)
		{
			var GenerateCrypto = new CommandApdu(IsoCase.Case4Short, card.Protocol)
			{
				CLA = 0x80,
				Instruction = (InstructionCode)0xAE,
				P1 = 0x80,
				Data = cryptData
			};

			//var fuckinAye = card.SendCommand(GenerateCrypto, "Crypt");

			CommandApdu command = card.InitApdu(true);
			command.CLA = 0x80;
			command.Instruction = (InstructionCode)0xAE;
			command.P1 = 0x80;
			command.Data = cryptData;
			return GenerateCrypto;
		}

		public static List<RecordAddress> ParseAddresses(byte[] data)
        {
            List<RecordAddress> results = new List<RecordAddress>();
            for (int idx = 0; idx < data.Length; idx += 4)
            {
                var newAddress = new RecordAddress()
                {
                    SFI = data[idx + 0] >> 3,
                    FromRecord = data[idx + 1],
                    ToRecord = data[idx + 2],
                    OfflineAddress = data[idx + 3],
                };
                results.Add(newAddress);
            }
            return results;
        }

		public static List<RecordAddress> ParseAddresses(Response gpoResponse)
		{
			var gpoTlv = Tlv.ParseTlv(gpoResponse.GetData());
			var fileData = FindValue(gpoTlv, new string[] { "77", "94" });
			return ParseAddresses(fileData);
		}

		public static CommandApdu BuildReadRecordApdu(RecordAddress address, byte idx, ICardMessager card)
        {
			CommandApdu command = card.InitApdu(false);
			command.CLA = 0;
            command.Instruction = InstructionCode.ReadRecord;
            command.P1 = idx;
            command.P2 = (byte)((address.SFI << 3) + 0x4);
			return command;
        }

        public static byte[] FindValue(Tlv tlv, IEnumerator<string> tags)
        {
            if (tlv.HexTag == tags.Current)
            {
                if (!tags.MoveNext())
                    return tlv.Value;

                foreach (Tlv child in tlv.Children)
                {
                    var val = FindValue(child, tags);
                    if (val != null)
                        return val;
                }
            }
            return null;
        }

        public static byte[] FindValue(ICollection<Tlv> tlv, IEnumerable<string> tags)
        {
            var enumerator = tags.GetEnumerator();
            if (enumerator.MoveNext())
                return FindValue(tlv.First(), enumerator);
            return null;
        }

		public static byte[] FindValue(byte[] data, IEnumerable<string> tags)
		{
			var dataTlv = Tlv.ParseTlv(data);
			return FindValue(dataTlv, tags);
		}

		public static byte[] FindValue(ICollection<Tlv> tlv, string tags)
        {
            return FindValue(tlv, tags.Split('/'));
        }


	}
}
