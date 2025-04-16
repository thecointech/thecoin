const { TestHelper } = require('zos');
const { Contracts, ZWeb3 } = require('zos-lib');

const ethers = require("ethers");

ZWeb3.initialize(web3.currentProvider);

const TheCoin = Contracts.getFromLocal('TheCoin');

require('chai').should();

try {
  contract('TheCoin', function (accounts) {

    // Create a wallet to sign the hash with
    const ethersClient = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
    const [acOwner, acTheCoin, acTCManager, acMinter, acPolice, Client1, Client2, client3, ...acRest] = accounts;
    //const acTCManager = accounts[2];
    //const acMinter = accounts[3];
    // , acPolice, client, ...acRest] = accounts;

    beforeEach(async () => {
      this.project = await TestHelper();
    })

    const buildContract = async (project) => await project.createProxy(TheCoin, {
      initMethod: 'initialize',
      initArgs: [acTheCoin]
    });

    it('should create a proxy for the EVM package', async function () {
      const proxy = await buildContract(this.project);
      const result = await proxy.methods.totalSupply().call();
      result.should.eq('0');
    })

    it('should construct with defaults', async function () {
      const proxy = await buildContract(this.project);
      const roles = await proxy.methods.getRoles().call();
      for (let i = 0; i < 4; i++)
        roles[i].should.eq(acTheCoin);

      const coinsCirculating = await proxy.methods.coinsCirculating().call();
      coinsCirculating.should.eq("0");
      const reservedCoins = await proxy.methods.reservedCoins().call();
      reservedCoins.should.eq("0");
      const totalSupply = await proxy.methods.totalSupply().call();
      totalSupply.should.eq('0');
    })

    it('should assign roles and limit them correctly', async function () {
      const proxy = await buildContract(this.project);

      await assignMinter(proxy);
      await acceptMinter(proxy);
      const roles = await proxy.methods.getRoles().call();
      roles[1].should.eq(acMinter);
    })

    it('should mint some coin', async function () {
      const proxy = await buildContract(this.project);

      await setMinter(proxy);

      const mintAmount = 1000000;
      await proxy.methods.mintCoins(mintAmount).send({from: acMinter});
      const minted = await proxy.methods.totalSupply().call();
      minted.should.eq(mintAmount.toString());
      const reservedCoins = await proxy.methods.reservedCoins().call();
      reservedCoins.should.eq(mintAmount.toString());
    })


    it('should xfer some coin', async function () {
      const proxy = await buildContract(this.project);

      await setMinter(proxy);

      const mintAmount = 1000000;
      const purchaseAmount = 50000;
      await proxy.methods.mintCoins(mintAmount).send({ from: acMinter });
      const now = new Date().valueOf();

      const eclient = ethersClient.address;
      await proxy.methods.coinPurchase(Client1, purchaseAmount, 0, now).send({ from: acTheCoin });

      const startbal1 = await proxy.methods.balanceOf(Client1).call();
      const startbal2 = await proxy.methods.balanceOf(Client2).call();
      parseInt(startbal1).should.eq(purchaseAmount);
      parseInt(startbal2).should.eq(0);

      const xferAmount = 12345;
      const xferCost = await proxy.methods.transfer(Client2, xferAmount).estimateGas({from: Client1});
      console.log("Transfer gas cost: ", xferCost);

      await proxy.methods.transfer(Client2, xferAmount).send({from: Client1});

      const endbal1 = await proxy.methods.balanceOf(Client1).call();
      const endbal2 = await proxy.methods.balanceOf(Client2).call();
      parseInt(endbal1).should.eq(startbal1 - xferAmount);
      parseInt(endbal2).should.eq(xferAmount);
    });

    const doCertXfer = async (proxy, value, fee) => {

      const eclient = ethersClient.address;
      const startbal = await proxy.methods.balanceOf(eclient).call();
      const startbal1 = await proxy.methods.balanceOf(Client1).call();
      const startbal2 = await proxy.methods.balanceOf(Client2).call();

      const timestamp = Math.round(new Date().valueOf() / 1000);
      // Compare the various hashes
      const certHash = web3.utils.soliditySha3(eclient, Client1, value, fee, timestamp);
      const contractHash = await proxy.methods.buildMessage(eclient, Client1, value, fee, timestamp).call();
      const ethersHash = ethers.utils.solidityKeccak256(
        ["address", "address", "uint256", "uint256", "uint256"],
        [eclient, Client1, value, fee, timestamp]
      );

      contractHash.should.eq(certHash);
      contractHash.should.eq(ethersHash);

      // Sign the binary data
      let messageHashBytes = ethers.utils.arrayify(ethersHash)
      let signature = await ethersClient.signMessage(messageHashBytes);

      // Check the signer matches what contract calculates
      const recoveredSigner = await proxy.methods.recoverSigner(eclient, Client1, value, fee, timestamp, signature).call();
      recoveredSigner.should.eq(eclient);

      let gasAmount = await proxy.methods.certifiedTransfer(eclient, Client1, value, fee, timestamp, signature)
                                         .estimateGas({gas:5000000, from:eclient})

      console.log("Cert Xfer gas amount: ", gasAmount);

      await proxy.methods.certifiedTransfer(eclient, Client1, value, fee, timestamp, signature).send({ from: Client2, gas: 200000 });

      const endbal = await proxy.methods.balanceOf(eclient).call();
      const endbal1 = await proxy.methods.balanceOf(Client1).call();
      const endbal2 = await proxy.methods.balanceOf(Client2).call();

      parseInt(endbal1).should.eq(parseInt(startbal1) + value);
      parseInt(endbal2).should.eq(parseInt(startbal2) + fee);
      parseInt(endbal).should.eq(parseInt(startbal) - (value + fee));
    };

    it('should do cert xfer some coin', async function () {
      const proxy = await buildContract(this.project);

      await setMinter(proxy);

      const mintAmount = 1000000;
      const purchaseAmount = 50000;
      await proxy.methods.mintCoins(mintAmount).send({ from: acMinter });
      const now = new Date().valueOf();

      const eclient = ethersClient.address;
      await proxy.methods.coinPurchase(eclient, purchaseAmount, 0, now).send({ from: acTheCoin });

      const balance = await proxy.methods.balanceOf(eclient).call();
      balance.should.eq(purchaseAmount.toString());

      const value = 1250;
      const fee = 25;

      // Do the first transfer
      await doCertXfer(proxy, value, fee);
      // ensure that we don't repeat the same timestamp
      await sleep(1000);
      // Do the second xfer
      await doCertXfer(proxy, value, fee);

      const ebal = await proxy.methods.balanceOf(eclient).call();
      const bal1 = await proxy.methods.balanceOf(Client1).call();
      const bal2 = await proxy.methods.balanceOf(Client2).call();

      parseInt(bal1).should.eq(value * 2);
      parseInt(bal2).should.eq(fee * 2);
      parseInt(ebal).should.eq(purchaseAmount - 2 * (value + fee));

    })
  })
} catch (err) {
  console.error(err);
}
