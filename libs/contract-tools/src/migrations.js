
module.exports = {
  writeContractFile(root, dest, network, address) {
    const outdir = path.join(root, '..', dest, 'deployed');
    if (!existsSync(outdir))
      mkdirSync(outdir);

    // Our contract-specific data (eg impl address, ProxyAdmin address etc) is in ../.openzeppelin/{network}.json
    const jsonFile = path.join(outdir, `${process.env.CONFIG_NAME}-${network}.json`);
    writeFileSync(jsonFile, JSON.stringify({
      contract: address,
    }))
  }
}
