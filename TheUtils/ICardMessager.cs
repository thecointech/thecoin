using PCSC.Iso7816;


namespace TheUtils
{
	public interface ICardMessager
	{
		CommandApdu InitApdu(bool hasData);

		byte[] SendCommand(CommandApdu apdu, string debugName);
		byte[] SendCommand(byte[] data, string debugName);

		PCSC.SCardProtocol Protocol { get; }
	}
}
