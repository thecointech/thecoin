import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { buildUberTransfer } from '@thecointech/utilities/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime, Duration } from 'luxon';
import '@nomicfoundation/hardhat-ethers';
import { EventLog, HDNodeWallet, Signer } from 'ethers';
import { AccountName, getSigner } from '@thecointech/signers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

const timeout = 10 * 60 * 1000;
jest.setTimeout(timeout);

describe.skip('Uberconverter delay tests', () => {
  it('Appropriately delays a transfer, and converts an appropriate amount at time', async () => {

    console.log("Start")
    const signers = initAccounts(await hre.ethers.getSigners());
    console.log("Signers initialized:", {
      owner: signers.Owner.address,
      client1: signers.Client1.address,
      client2: signers.Client2.address
    });

    const UberConverter = await hre.ethers.getContractFactory('UberConverter');
    console.log("UberConverter factory created");

    const tcCore = await createAndInitTheCoin(signers.Owner);
    console.log("TheCoin Core initialized at:", await tcCore.getAddress());

    const oracle = await createAndInitOracle(signers.OracleUpdater);
    console.log("Oracle initialized at:", await oracle.getAddress());
    console.log("Init Complete")

    // pass some $$$ to Client1
    const initAmount = 10000e6;
    await tcCore.mintCoins(initAmount, signers.Owner, Date.now());
    const ownerBalance = await tcCore.balanceOf(signers.Owner);
    console.log("Owner balance after mint:", ownerBalance.toString());

    await tcCore.transfer(signers.Client1, initAmount);
    const client1Balance = await tcCore.balanceOf(signers.Client1);
    console.log("Client1 balance after transfer:", client1Balance.toString());
    console.log("Xfer Complete")

    // Create plugin
    console.log("Deploying UberConverter...");
    const uber = await UberConverter.deploy();
    console.log("UberConverter deployed at:", await uber.getAddress());

    console.log("Initializing UberConverter with:", {
      tcCore: await tcCore.getAddress(),
      oracle: await oracle.getAddress()
    });
    await uber.initialize(tcCore, oracle);
    console.log("Deploy Complete")

    // Assign to user, grant all permissions
    const request = await buildAssignPluginRequest(signers.Client1, uber, ALL_PERMISSIONS);
    console.log("Plugin request built for Client1");
    try {
      await assignPlugin(tcCore, request);
      console.log("Plugin assigned successfully");
    } catch (error) {
      console.error("Failed to assign plugin:", error);
      throw error;
    }
    console.log("Plugin Complete")

    // Transfer $100 in 1 weeks time.
    const delay = Duration.fromObject({day: 7});
    const transfer = await buildUberTransfer(
      signers.Client1,
      signers.Client2,
      new Decimal(100),
      124,
      DateTime.now().plus(delay),
    );

    let receipt;
    try {
      const r = await tcCore.uberTransfer(
        transfer.chainId,
        transfer.from,
        transfer.to,
        transfer.amount,
        transfer.currency,
        transfer.transferMillis,
        transfer.signedMillis,
        transfer.signature,
      );
      receipt = await r.wait();
    } catch (error: any) {
      console.error("Transfer failed:", {
        error,
        errorMessage: error.message,
        data: error.data,
        transaction: error.transaction,
      });
      throw error;
    }
    console.log("Uber Complete")
    const interim1Balance = await tcCore.pl_balanceOf(signers.Client1);
    // If we transferred $100, that should have equalled 50C
    expect(initAmount - Number(interim1Balance)).toEqual(50e6);
    // but Client2 has not actually received anything yet, so it's balance is 0
    const interim2Balance = await tcCore.pl_balanceOf(signers.Client2);
    expect(Number(interim2Balance)).toEqual(0);
    // No money was transferred, so no events!
    expect(receipt.logs?.filter((e: EventLog) => e.eventName == "Transfer").length).toEqual(0);
    // TODO: Log event for reserving $$$

    // Ensure that Client1 cannot transfer out dosh
    const rawBalance = await tcCore.balanceOf(signers.Client1);
    expect(Number(rawBalance)).toEqual(initAmount);
    const tcClient1 = tcCore.connect(signers.Client1);
    // Ensure we can't transfer more than is promised
    await expect(
      tcClient1.transfer(signers.BrokerCAD, initAmount)
    ) .rejects
      .toThrow()
    console.log("Test Failed Xfer Complete")

    // Now advance time so that that Client2 can claim the transfer
    // Note, we need the additional day as times around midnight seem to fail otherwise
    await hre.network.provider.send("evm_increaseTime", [delay.plus({day: 1}).as("seconds")]);
    console.log("Evm Time Increase complete")

    // TheCoin rate is now $4
    await setOracleValueRepeat(oracle, 4, 8);
    console.log("Oracle Update complete")

    const validTill = await oracle.validUntil();
    expect(Number(validTill)).toBeGreaterThan(transfer.transferMillis);
    // Assert that the pending transfer reflects the new value
    const finalBalance = await tcCore.pl_balanceOf(signers.Client1);
    expect(initAmount - Number(finalBalance)).toEqual(25e6);

    // Process pending transactions
    const p = await uber.processPending(transfer.from, transfer.to, transfer.transferMillis);
    const preceipt = await p.wait();
    console.log("Process Complete")

    const final1Balance = await tcCore.pl_balanceOf(signers.Client1);
    // If we transferred $100, that should have equalled 25C
    expect(initAmount - Number(final1Balance)).toEqual(25e6);
    // Client2 should now have it's transfer deposited.
    const final2Balance = await tcCore.pl_balanceOf(signers.Client2);
    expect(Number(final2Balance)).toEqual(25e6);

    // money was transferred, check all the info is correct
    const allEvents =  preceipt.logs?.map(e => (e as EventLog).eventName ? e : tcCore.interface.parseLog(e)) as any[];
    const allEventNames = allEvents?.map(e => e.eventName ?? e.name);
    expect(allEventNames?.length).toBe(3)
    expect(allEventNames).toContain("ValueChanged");
    expect(allEventNames).toContain("Transfer");
    expect(allEventNames).toContain("ExactTransfer");

    const et = allEvents?.find(e => e.name == "ExactTransfer")
    expect(et?.args?.from).toEqual(transfer.from);
    expect(et?.args?.to).toEqual(transfer.to);
    expect(Number(et?.args?.timestamp)).toEqual(transfer.transferMillis);
  }, timeout);
});

const getSignerWithAddress = async (s: AccountName) => {
  const signer = await getSigner(s);
  return signer.connect(hre.ethers.provider) as unknown as SignerWithAddress;
}
const getSigners = async () => {
  const Owner = await getSignerWithAddress("Owner");
  const OracleUpdater = await getSignerWithAddress("OracleUpdater");
  const Client1 = await getSignerWithAddress("Client1");
  const Client2 = await getSignerWithAddress("Client2");
  return {
    Owner,
    OracleUpdater,
    Client1,
    Client2
  };
}

describe('Uberconverter current tests', () => {

  it('converts fiat to TheCoin for current transfers', async () => {

    const oriSigners = await hre.ethers.getSigners();
    console.log(oriSigners[0].address);
    const signers = await getSigners();
    const UberConverter = await hre.ethers.getContractFactory('UberConverter');
    const tcCore = await createAndInitTheCoin(signers.Owner);
    const oracle = await createAndInitOracle(signers.OracleUpdater);

    // pass some $$$ to Client1
    await tcCore.mintCoins(10000e6, signers.Owner, Date.now());
    await tcCore.transfer(signers.Client1, 1000e6);

    // Create plugin
    const uber = await UberConverter.deploy();
    await uber.initialize(tcCore, oracle);

    // Assign to user, grant all permissions
    const request = await buildAssignPluginRequest(signers.Client1, uber, ALL_PERMISSIONS);
    await assignPlugin(tcCore, request);

    // Transfer $100 now.
    const transfer = await buildUberTransfer(
      signers.Client1,
      signers.Client2,
      new Decimal(100),
      124,
      DateTime.now(),
    )
    const initBalance = await tcCore.balanceOf(signers.Client1);
    const r = await tcCore.uberTransfer(
      transfer.chainId,
      transfer.from,
      transfer.to,
      transfer.amount,
      transfer.currency,
      transfer.transferMillis,
      transfer.signedMillis,
      transfer.signature,
    );
    const receipt = await r.wait();
    const Client1Balance = await tcCore.balanceOf(signers.Client1);
    // If we transferred $100, that should have equalled 50C
    expect(Number(initBalance - Client1Balance)).toEqual(50e6);
    // Client2Balance should be the remainder
    const Client2Balance = await tcCore.balanceOf(signers.Client2);
    expect(Number(Client2Balance)).toEqual(50e6);

    // The money was transferred, there should be logs!
    expect(receipt.logs?.filter((e: EventLog) => e.eventName == "Transfer").length).toEqual(1);
    expect(receipt.logs?.filter((e: EventLog) => e.eventName == "ExactTransfer").length).toEqual(1);
  }, timeout);
});
