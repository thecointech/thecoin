using PCSC.Iso7816;


namespace TheUtils
{
	public interface ICardMessager
	{
		CommandApdu InitApdu(bool hasData);

		Response SendCommand(CommandApdu apdu, string debugName);
		Response SendCommand(byte[] data, string debugName);

		PCSC.SCardProtocol Protocol { get; }
	}
}
