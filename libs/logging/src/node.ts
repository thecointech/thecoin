import bunyan from "bunyan";
import { getConsoleStream } from "./consolestream";
import { getFileStream } from "./filestream";
import { getSeqStream } from './seqstream';

const getStreams = (name: string, level?: number) => {
  const streams = [getConsoleStream(level)];
  // Are we testing with jest?
  if (process.env.JEST_WORKER_ID === undefined) {
    // Do we have a output folder specifed?
    if (process.env.TC_LOG_FOLDER && process.env.TC_LOG_FOLDER !== 'false')
    {
      const stream = getFileStream(name, process.env.TC_LOG_FOLDER, true)
      streams.push(stream);
    }
    if (process.env.URL_SEQ_LOGGING && process.env.URL_SEQ_LOGGING !== 'false')
    {
      const stream = getSeqStream(name, process.env.URL_SEQ_LOGGING)
      streams.push(stream);
    }
  }
  return streams;
}

export const init_node = (name: string, level?: number) =>
  bunyan.createLogger({
    name,
    streams: getStreams(name, level),
  });
