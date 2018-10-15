using BerTlv;
using System;
using System.Collections.Generic;
using System.Text;

namespace TheUtils
{
    public class Testing
    {
        public static bool SendTestTransaction(ulong currencyAmount, ICardInterface card)
        {
            // We perform initial, constant interactions in this phase
            // For now - hard-coded queries, ignore responses
            byte[] SEL_FILE = new byte[] { 0x00, 0xA4, 0x04, 0x00, 0x0E, 0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00 };
            var selResponse = card.SendRecieveCommand(SEL_FILE);
            var tlvSelResponse = Tlv.ParseTlv(selResponse);

            var paymentApp = tlvSelResponse;
            var SelApp = new CommandApdu
            {
                Instruction = InstructionCode.SelectFile,
                P1 = 0x04, // read the first file (I think?)
                Data = Processing.FindValue(tlvSelResponse, new string[] { "6F", "A5", "BF0C", "61", "4F" })
            };
            var appResponse = card.SendRecieveCommand(SelApp.ToArray());

            // Extract the PDOL
            var appTlv = Tlv.ParseTlv(appResponse);
            var pdolData = Processing.FindValue(appTlv, new string[] { "6F", "A5", "9F38" });
            var pdolParsed = PDOL.ParsePDOLItems(pdolData);

            // Normally this would get sent back to the client to be filled by the terminal
            PDOL.FillWithDummyData(pdolParsed, currencyAmount);

            var gpo = new CommandApdu()
            {
                CLA = 0x80,
                Instruction = (InstructionCode)0xA8,
                Data = PDOL.GeneratePDOL(pdolParsed)
            };
            var gpoResponse = card.SendRecieveCommand(gpo.ToArray());

            var fileList = Processing.ParseAddresses(gpoResponse);
            byte[] cdol = null;
            foreach (var file in fileList)
            {
                for (byte recordNum = file.FromRecord; recordNum <= file.ToRecord; recordNum++)
                {
                    var rr = new CommandApdu();
                    Processing.BuildReadRecordApdu(rr, file, recordNum);
                    var record = card.SendRecieveCommand(rr.ToArray());

                    var rrtlv = Tlv.ParseTlv(record);
                    if (cdol == null)
                        cdol = Processing.FindValue(rrtlv, new string[] { "70", "8C" });
                }
            }

            if (cdol != null)
            {
                var cdolParsed = PDOL.ParsePDOLItems(cdol);

                PDOL.FillWithDummyData(cdolParsed, currencyAmount);

                var GenerateCrypto = new CommandApdu()
                {
                    CLA = 0x80,
                    Instruction = (InstructionCode)0xAE,
                    P1 = 0x80,
                    Data = PDOL.GenerateCDOL(cdolParsed)
                };

                var fuckinAye = card.SendRecieveCommand(GenerateCrypto.ToArray());
                var faBytes = fuckinAye;

                return true;
            }
            return false;
        }
    }
}
