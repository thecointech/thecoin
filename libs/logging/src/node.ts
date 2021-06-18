import bunyan from "bunyan";
import { getConsoleStream } from "./consolestream";
import { getFileStream } from "./filestream";

const getStreams = (name: string) => {
  const streams = [getConsoleStream()];
  // Are we testing with jest?
  if (process.env.JEST_WORKER_ID === undefined) {
    // Do we have a output folder specifed?
    if (process.env.TC_LOG_FOLDER)
    {
      const stream = getFileStream(name, process.env.TC_LOG_FOLDER, true)
      streams.push(stream);
    }
  }
  return streams;
}

export const init_node = (name: string) =>
  bunyan.createLogger({
    name,
    streams: getStreams(name)
  });
