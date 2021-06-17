using BerTlv;
using PCSC.Iso7816;

namespace TheUtils
{
    public class Testing
    {
        public static bool SendTestTransaction(ulong currencyAmount, ICardMessager card)
        {
            // We perform initial, constant interactions in this phase
            // For now - hard-coded queries, ignore responses
            byte[] SEL_FILE = new byte[] { 0x00, 0xA4, 0x04, 0x00, 0x0E, 0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00 };
            var selResponse = card.SendCommand(SEL_FILE);
            var tlvSelResponse = Tlv.ParseTlv(selResponse);
			var SelApp = new CommandApdu(IsoCase.Case4Short, card.Protocol)
            {
                Instruction = InstructionCode.SelectFile,
                P1 = 0x04, // read the first file (I think?)
                Data = Processing.FindValue(tlvSelResponse, new string[] { "6F", "A5", "BF0C", "61", "4F" })
            };
            var appResponse = card.SendCommand(SelApp);

            // Extract the PDOL
            var appTlv = Tlv.ParseTlv(appResponse);
            var pdolData = Processing.FindValue(appTlv, new string[] { "6F", "A5", "9F38" });
            var pdolParsed = PDOL.ParsePDOLItems(pdolData);

            // Normally this would get sent back to the client to be filled by the terminal
            PDOL.FillWithDummyData(pdolParsed, currencyAmount);

            var gpo = new CommandApdu(IsoCase.Case4Short, card.Protocol)
            {
                CLA = 0x80,
                Instruction = (InstructionCode)0xA8,
                Data = PDOL.GeneratePDOL(pdolParsed)
            };
            var gpoResponse = card.SendCommand(gpo);

            var fileList = Processing.ParseAddresses(gpoResponse);
            byte[] cdol = null;
            foreach (var file in fileList)
            {
                for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
                {
                    //var rr = new CommandApdu(IsoCase.Case2Short, card.Protocol);
                    var rr = Processing.BuildReadRecordApdu(file, recordNum, card);
                    var record = card.SendCommand(rr);

                    var rrtlv = Tlv.ParseTlv(record);
                    if (cdol == null)
                        cdol = Processing.FindValue(rrtlv, new string[] { "70", "8C" });
                }
            }

            if (cdol != null)
            {
                var cdolParsed = PDOL.ParsePDOLItems(cdol);

                PDOL.FillWithDummyData(cdolParsed, currencyAmount);

                var GenerateCrypto = new CommandApdu(IsoCase.Case4Short, card.Protocol)
                {
                    CLA = 0x80,
                    Instruction = (InstructionCode)0xAE,
                    P1 = 0x80,
                    Data = PDOL.GenerateCDOL(cdolParsed)
                };

                var final = card.SendCommand(GenerateCrypto);
                return final?.Length > 0;
            }
            return false;
        }
    }
}
