export { };

(async () => {
  if (process.argv[2] == 'clone') {
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
