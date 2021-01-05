// import { toHuman } from "@the-coin/utilities";
// import { Contract, ethers } from "ethers";
// import { TransactionResponse } from "ethers/providers";
// import { DateTime } from "luxon";
// import { Transaction } from "./types";

// export async function getHistory(contract: Contract) {
//   const etherscanProvider = new ethers.providers.EtherscanProvider("ropsten");
//   const history = await etherscanProvider.getHistory(contract.address);
//   const txPromises = history.map(tx => toTransaction(tx, contract));
//   const txs = await Promise.all(txPromises)
//   return txs;
// }


// async function toTransaction(tx: TransactionResponse, contract: Contract) {
//   //const res = contract.interface.parseLog(tx);
//   //const { from, to, value } = res.values;

//   const { hash } = tx;
//   if (!hash)
//     return null;

//   const txReceipt = await contract.provider.getTransactionReceipt(hash);
//   if (!txReceipt.logs || !txReceipt.blockHash)
//     return null;

//   const logs = txReceipt.logs.map(contract.interface.parseLog);

//   return {
//     txHash: tx.hash,
//     type: logs[0].name!,
//     change: 0,
//     from: "",
//     to: "",
//   }

//   // if (!await addAdditionalInfo(r, contract)) {
//   //   const block = await contract.provider.getBlock(tx.blockNumber!);
//   //   r.date = DateTime.fromMillis(block.timestamp * 1000)
//   //   //r.logEntry = `Transfer: ${toWallet ? from : to}`
//   // }
//   return r;
// }


// async function getLogs(hash: string, contract: Contract) {

//   // Parse out additional purchase/redeem info
//   const txReceipt = await contract.provider.getTransactionReceipt(hash);
//   if (!txReceipt.logs || !txReceipt.blockHash)
//     return null;

//   const logs = txReceipt.logs.map(contract.interface.parseLog);
//   return logs;
//   // const blockData = await contract.provider.getBlock(txReceipt.blockHash)

//   // for (let i = 0; i < txReceipt.logs.length; i++) {
//   //   const extra = contract.interface.parseLog(txReceipt.logs[i]);
//   //   if (extra && extra.name == "Purchase") {
//   //     const { timestamp } = extra.values;
//   //     transaction.date = DateTime.fromMillis(timestamp.toNumber() * 1000);
//   //     transaction.completed = DateTime.fromMillis(blockData.timestamp * 1000);
//   //     const change = toHuman(transaction.change, true);
//   //     //if (toWallet) {
//   //     //  transaction.balance = balance.toNumber();
//   //       transaction.logEntry = `Purchase: ${change}`
//   //     //}
//   //     //else {
//   //     //  transaction.logEntry = `Sell: ${change}`
//   //     //}
//   //     return true;
//   //   }
//   // }
//   // return false;
// }
