import { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';
import { projectUrl } from '@thecointech/setenv/projectUrl';
import { fileURLToPath } from 'url';

const baseurl = projectUrl();
export const getConsoleStream = (level?: number) : Stream => (
  {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath: fileURLToPath(baseurl ?? "./"),
      forceColor: true,
    })
  }
)
