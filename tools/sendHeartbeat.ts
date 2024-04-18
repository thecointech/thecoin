import { GetHarvesterApi } from '@thecointech/apis/broker';

try {
  const r = await GetHarvesterApi().heartbeat({
    timeMs: 0,
    result: "success",
    signature: "asdfasdf",
  });

  console.log(r.statusText);
}
catch(e) {
  console.log(e.message);
}
