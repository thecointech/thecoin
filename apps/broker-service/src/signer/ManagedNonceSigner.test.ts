import { guardFn, ManagedNonceSigner } from "./ManagedNonceSigner";
import { init } from "@thecointech/firestore";
import { Wallet } from 'ethers';
import hre from 'hardhat';

it ('Signs txs with the right nonce', async () => {
  await init();
  const [owner] = await (hre as any).ethers.getSigners();
  const tx = {
    to: '0x92d3267215Ec56542b985473E73C8417403B15ac',
    value: 100_000_000n,
  };
  // Send initial tx
  const tx1 = await owner.sendTransaction(tx);
  expect(tx1.nonce).toBe(0);
  // should init with nonce 1
  const signer = new ManagedNonceSigner(owner);
  const tx2 = await signer.sendTransaction(tx);
  expect(tx2.nonce).toBe(1);

  // Check it's stored right
  guardFn(owner.address, async (lastNonce) => {
    expect(lastNonce).toBe(1);
    return {} as any;
  })
})

it ('Manages nonces from multiple signers', async () => {

  await init();
  const wallet1 = Wallet.createRandom();
  const wallet2 = Wallet.createRandom();
  await guardFn(wallet1.address, async (lastNonce) => {
    expect(lastNonce).toBeUndefined();
    return {
      nonce: 3
    } as any;
  })
  await guardFn(wallet2.address, async (lastNonce) => {
    expect(lastNonce).toBeUndefined();
    return {
      nonce: 9
    } as any;
  })

  await guardFn(wallet1.address, async (lastNonce) => {
    expect(lastNonce).toBe(3);
    return {
      nonce: 7
    } as any;
  })
  await guardFn(wallet2.address, async (lastNonce) => {
    expect(lastNonce).toBe(9);
    return {} as any;
  })
})
