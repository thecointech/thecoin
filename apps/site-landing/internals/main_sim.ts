globalThis.it = ((msg: string, cb: ()=> void) => cb()) as any;
(globalThis as any).expect = (src: any) => ({
  toEqual: (comp: any) => {
    if (src != comp) {
      console.log(`Test Failed: ${src} == ${comp}`);
      debugger;
      throw new Error('Something');
    }
  }
})
// This script is the easiest way to run our tests with nice
// VS code visualizers etc built-in
require('../src/containers/ReturnProfile/data/sim.shockAbsorber.test');
