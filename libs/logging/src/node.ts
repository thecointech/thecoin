import bunyan from "bunyan";
import { getConsoleStream } from "./streams/consolestream";
import { getFileStream } from "./streams/filestream";
import { getSeqStream } from './streams/seqstream';
import { createLoggerProxy } from "./loggerContext";

const getStreams = (name: string, level?: number) => {
  const streams = [];
  // Are we testing with jest?
  if (process.env.IS_TESTING === undefined) {
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

  // Bind all logging methods to ensure they maintain their context
  // logger.trace = logger.trace.bind(logger);
  // logger.debug = logger.debug.bind(logger);
  // logger.info = logger.info.bind(logger);
  // logger.warn = logger.warn.bind(logger);
  // logger.error = logger.error.bind(logger);
  // logger.fatal = logger.fatal.bind(logger);
  return createLoggerProxy(logger);
};
