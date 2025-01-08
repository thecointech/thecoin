import { Recorder } from '../../src/record';
import { LandingWriter } from './landing';
import { init } from './init';
import { sleep } from '@thecointech/async';
import { getConfig } from './config';

const { baseFolder, config } = getConfig();
await init(baseFolder)

const name = "RBC";
const recorder = await Recorder.instance({
  name: "autorecord",
  url: config[name].url,
});
// Wait an additional 5 seconds because these pages take _forever_ to load
await sleep(5000);
const page = recorder.getPage();

await LandingWriter.process(page, name);

await Recorder.release();

// This should navigate to the bank page
