import { getSigner } from '@thecointech/signers'
import { NormalizeAddress } from '@thecointech/utilities';

const builtin = [
  "51e1153ee05efcf473d581c15b3f7b760ca5ddb3", // BrokerTransferAsst
  "0x38DE1B6515663DBE145CC54179ADDCB963BB606A", // Old BrokerCAD
  "2fe3cbf59a777e8f4be4e712945ffefc6612d46f", // New BrokerCAD
  "4f107b6633a4b3385c9e20945144c59ce4ff2def" // TheCoin
].map(NormalizeAddress)
export const bothBuiltIn = (a: string, b: string) => builtin.includes(NormalizeAddress(a)) && builtin.includes(NormalizeAddress(b));

const skippable = [
  "445758e37f47b44e05e74ee4799f3469de62a2cb", // TestAcc
  "0x0C327B7FCC6FF94F606B3D31D534F25B5604A0D1", // Old TestAcc
  "0xD0C3C0E7E94969B78EFF6BD531DBD6D0E90769F0", // Old Test Acc

  "0x6B0F02250EDCE9062B2515608C6EDA19E24F329E", // Empty account, includes quite a few issues so just skip it
  "0xbe0B3F8ae028818BAd966DaA20B29181ec3DFc06", // original TheCoin0x1198AacEf87b53cA5610c68fd83dF9577d54Cc0C
].map(NormalizeAddress)
export const toIgnore = (address: string) => skippable.includes(NormalizeAddress(address));

let changable :Record<string, string>= {};
export async function changeInit() {
  const brokerCad = await getSigner("BrokerCAD");
  const brokerCadAddress = NormalizeAddress(await brokerCad.getAddress());
  changable = {
    [NormalizeAddress("0x38de1b6515663dbe145cc54179addcb963bb606a")]: brokerCadAddress,
    [NormalizeAddress('0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f')]: brokerCadAddress,
    [NormalizeAddress('0x8B40D01D2bcFFef5CF3441a8197cD33e9eD6e836')]: NormalizeAddress('ca8eea33826f9ada044d58cac4869d0a6b4e90e4'),
  }

}
export const toChange = (address: string) => changable[NormalizeAddress(address)] ?? address;

export const tweakBalance = (address: string, balance: number) => {
  // Eliminating refund means losing missing xaTransfer
  if (address == "0x1198AACEF87B53CA5610C68FD83DF9577D54CC0C") return 0; // closed manually
  if (address == "0xD86C97292B9BE3A91BD8279F114752248B80E8C5") return 0; // closed manually
  if (address == "0x8B40D01D2BCFFEF5CF3441A8197CD33E9ED6E836") return 0; // account swept into another account
  if (address == "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4") return balance + 28495311 + 5000; // skipped refund & sweep
  if (address == "0x4F860CC3A249D1072AE569F2103906BD787EA1E5") return balance + 5000; // skipped refund
  return balance;
}

//
// Refunds are transactions that we ignore
const refunds = {
  "0xcc86bfb3ec0702ba999f308ea975e0ac73dc5e640e78a176267eed2723a9ea7e": "0x50625c25d599a45c7d2e13a424952060d4ba3e57a9464fe81eff796c039b414b",
  "0x1954b74d181172a4014ece1888cac878598d136397ad5e2150066ad5232f6782": "0xe97f8a03399ce40b12203be04e62af5890ec1d2850c26c4e0c89ae423f2031a5",
  "0xb0644af4c3d64077e102020f1ec5a6496d0290bfff3987eebd0dbdf59a17e46e": "0x82d10b1500e12fcfe7dec2cd20451212296dae45104f5f153ca21411fb3dcbcd",
  "0xab38262081326e427e8d1532c1d2bbedfe4b157f77b3a1210f22c85ac73597a8": "0xfae8af589e8bfeb21915922330ca1f506f16d9a42b78728ce92376fe111029b5",
  "0x060b10d13539d5c245969ef18b5353584fe39eb6d6fe7cec62cd4c761bee47ab": "0x8d77fe0f15271699cfb5d67e977bcf6b05de610d0742dd171a054c94f3ca4371",
  "0xea8a7a736f2373e58329dc7a7fe9be753c1e75095d2d48d895efa64ab8e29b22": "0xb61bc05409657c169bec5e680d22f3a6eda17fed8f3596c5485136c92c8da923",
}
export const isRefund = (hash: string) => (
  !!Object.entries(refunds)
    .find(([l, r]) =>
      hash == l || hash == r
    )
)
