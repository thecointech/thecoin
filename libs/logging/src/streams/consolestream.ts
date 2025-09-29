import { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';
import { projectUrl } from '@thecointech/setenv/projectUrl';
import { fileURLToPath } from 'url';

export const getConsoleStream = (level?: number) : Stream => {

  const basePath = (process.env.NODE_ENV === "production")
    ? process.cwd()
    : fileURLToPath(projectUrl());
  return   {
    level: level ?? 'trace',
    stream: debug_stream({
      basepath: basePath,
      forceColor: true,
    })
  }

}
