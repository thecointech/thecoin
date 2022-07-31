import { Core } from '@self.id/core'
import { isFunctionLike } from 'typescript';
import { getConfig } from '../src/config';
import { getHistory } from '../src/history';


const aliases = await getConfig();
const core = new Core({ ceramic: 'testnet-clay', aliases});

const all = await getHistory("0x445758e37f47b44e05e74ee4799f3469de62a2cb", core);
if (all) {
  for (const commit of all) {
    console.log(JSON.stringify(commit));
  }
}
