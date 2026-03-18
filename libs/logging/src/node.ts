import bunyan from "bunyan";
import { getConsoleStream } from "./streams/consolestream";
import { getFileStream } from "./streams/filestream";
import { getSeqStream } from './streams/seqstream';
import { createLoggerProxy } from "./loggerContext";
import './loggerContextNode'; // Auto-registers via static initialization block
import { endStreams } from "./streams/endStreams";

const getStreams = (name: string, level?: number) => {
  const streams = [];
  // Are we testing with jest?
  if (process.env.RUNTIME_ENV !== "test") {
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
  streams.push(getConsoleStream(level));
  return streams;
}

export const init_node = (name: string, level?: number) => {
  const logger = bunyan.createLogger({
    name,
    streams: getStreams(name, level),
  });

  return createLoggerProxy(logger, () => endStreams(logger));
};
