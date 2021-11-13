import { Processor } from './processor';

const p = new Processor();
p.init().then(() => p.process())
