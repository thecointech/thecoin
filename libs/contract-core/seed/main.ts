export { };

//
// Seed a new contract.  This script should
// only be executed once per deployment.
// Moved out of migrations because migrations
// only allows the use of a single hardware wallet,
// and both TheCoin & Owner will be hardware in prod
(async () => {
  if (process.env.DEPLOY_CONTRACT_INIT === 'clone') {
    const { Processor } = await import('./clone');
    const p = new Processor();
    await p.init();
    await p.process();
  }
  else {
    const { devliveDistribution } = await import('./devlive');
    await devliveDistribution();
  }
})();
