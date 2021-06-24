import { Stream } from 'bunyan';
import { join } from 'path';
import debug_stream from 'bunyan-debug-stream';

const basepath = join(__dirname, "..", "..", "..");

export const getConsoleStream = (level?: number) : Stream => (
  {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath,
      forceColor: true,
    })
  }
)
