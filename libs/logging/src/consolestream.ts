import { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';
import { fileURLToPath } from 'url';

const basepath = fileURLToPath(new URL("../../..", import.meta.url));

export const getConsoleStream = (level?: number) : Stream => (
  {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath,
      forceColor: true,
    })
  }
)
