import { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';

export const getConsoleStream = (level?: number) : Stream => {

  // On devlive, this gives nice relative paths.  Everywhere else, it's process.cwd()
  const basepath = process.env.TC_DEVLIVE_LOGGING_ROOT || process.cwd();
  return {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath,
      forceColor: true,
    })
  }

}
