using PCSC.Iso7816;


namespace TheUtils
{
	public interface ICardMessager
	{
		CommandApdu InitApdu(bool hasData);

		byte[] SendCommand(CommandApdu apdu);
		byte[] SendCommand(byte[] data);

		PCSC.SCardProtocol Protocol { get; }
	}
}
