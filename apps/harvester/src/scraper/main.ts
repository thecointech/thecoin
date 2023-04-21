// import { Recorder } from './record';
import { replay } from './replay';

// (async () => {
//     const recorder =  await Recorder.instance("chqBalance", "<url>");
//     // const r = await recorder.setRequiredValue();
//     // console.log("We got " + r)
// })();

replay("chqBalance");
