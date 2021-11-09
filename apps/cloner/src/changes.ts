import { getSigner } from '@thecointech/signers'
import { NormalizeAddress } from '@thecointech/utilities';

const skippable = [
  "0x1198AACEF87B53CA5610C68FD83DF9577D54CC0C",
  "0xD86C97292B9BE3A91BD8279F114752248B80E8C5",
]
export const toIgnore = (address: string) => skippable.includes(address);

let changable :Record<string, string>= {};
export async function changeInit() {
  const brokerCad = await getSigner("BrokerCAD");
  const brokerCadAddress = NormalizeAddress(await brokerCad.getAddress());
  changable = {
    [NormalizeAddress("0x38de1b6515663dbe145cc54179addcb963bb606a")]: brokerCadAddress,
    [NormalizeAddress('0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f')]: brokerCadAddress,
  }

}
export const toChange = (address: string) => changable[address] ?? address;

