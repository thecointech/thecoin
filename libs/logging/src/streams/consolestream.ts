import { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';
import { projectUrl } from '@thecointech/setenv/projectUrl';
import { fileURLToPath } from 'url';

export const getConsoleStream = (level?: number) : Stream => (
  {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath: fileURLToPath(projectUrl()),
      forceColor: true,
    })
  }
)
