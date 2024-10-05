import { Wallet } from "ethers";
import { CertifiedTransferRequest, BillPayeePacket } from "@thecointech/types";
import { BuildVerifiedAction, getSigner } from "./VerifiedAction";
// import hre from 'hardhat';

// const factory = await hre.ethers.getContractFactory("TheCoin");

const wallet = Wallet.createRandom();
const value = 100000;
const fee = 2000;

// TODO: move contract-specific elements to ../contract

// test("Can encrypt/decrypt payment name", async () => {
//   const name = "My Visa";
//   const payee: BrokerCAD.BillPayeePacket = {
//     payee: "TD Visa or some such",
//     accountNumber: "123456789123456789"
//   };

//   const encrypted = await EncryptPayee(wallet, name, payee);
//   const decryptName = DecryptName(wallet, encrypted.name!);
//   expect(decryptName).toMatch(name);
// });

// Helper to verify that the transfer is avlid
// async function VerifyTransfer(xfer: CertifiedTransferRequest) {
//   const contract = await factory.deploy();
//   var xferSigner = await contract.recoverSigner(
//     xfer.from,
//     xfer.to,
//     xfer.value,
//     xfer.fee,
//     xfer.timestamp,
//     xfer.signature
//   );
//   expect(xferSigner).toMatch(wallet.address);
// }

// test("Can build full verified billpayment", async () => {
//   const payee: BillPayeePacket = {
//     payee: "TD Visa or some such",
//     accountNumber: "123456789123456789"
//   };

//   const sale = await BuildVerifiedAction(
//     payee,
//     wallet,
//     wallet.address,
//     value,
//     fee
//   );
//   await VerifyTransfer(sale.transfer);

//   // verify that our action signature is valid
//   const signer = getSigner(sale);
//   expect(signer).toMatch(wallet.address);
// });

// test("Can build partial verified billpayment", async () => {
//   const name = "My Visa";
//   const payee: BillPayeePacket = {};

//   const sale = await BuildVerifiedBillPayment(
//     payee,
//     name,
//     wallet,
//     wallet.address,
//     value,
//     fee
//   );
//   VerifyTransfer(sale.transfer);

//   // verify that our email signature is valid
//   const signer = GetPacketSigner(sale);
//   expect(signer).toMatch(wallet.address);
// });

// test("Passes if missing name", async () => {
//   const invalidPayee: BillPayeePacket = {
//     payee: "TD Visa or some such",
//     accountNumber: "123456789123456789"
//   };

//   const sale = await BuildVerifiedBillPayment(
//     invalidPayee,
//     "",
//     wallet,
//     wallet.address,
//     value,
//     fee
//   );
//   // verify that our email signature is valid
//   const signer = GetPacketSigner(sale);
//   expect(signer).toMatch(wallet.address);
// });

// test("Fails if missing name & other", async () => {
//   const invalidPayee: BillPayeePacket = {
//     payee: "TD Visa or some such"
//   };

//   const fn = async () =>
//     await BuildVerifiedBillPayment(
//       invalidPayee,
//       "",
//       wallet,
//       wallet.address,
//       value,
//       fee
//     );
//   expect(fn()).rejects.toEqual(new Error("Invalid data supplied to GetHash"));
// });

// test("Fails if XOR accountName/payee", async () => {
//   const name = "something";
//   const missingAccountNumber: BillPayeePacket = {
//     payee: "TD Visa or some such"
//   };

//   const fn1 = async () =>
//     await BuildVerifiedBillPayment(
//       missingAccountNumber,
//       name,
//       wallet,
//       wallet.address,
//       value,
//       fee
//     );
//   expect(fn1()).rejects.toEqual(new Error("Invalid data supplied to GetHash"));

//   const missingPayee: BillPayeePacket = {
//     accountNumber: "123456789123456789"
//   };

//   const fn2 = async () =>
//     await BuildVerifiedBillPayment(
//       missingPayee,
//       name,
//       wallet,
//       wallet.address,
//       value,
//       fee
//     );
//   expect(fn2()).rejects.toEqual(new Error("Invalid data supplied to GetHash"));
// });
