import seq from 'bunyan-seq';
import type { Stream } from 'bunyan';

export const getSeqStream = (name: string, serverUrl: string) : Stream => {

  console.log("Logging to seq:", serverUrl);

  return seq.createStream({
    name,
    serverUrl,
    level: 'info',
    reemitErrorEvents: true,
    onError: (e) => {
      console.error('[SeqStreamCustomError] failed to log events:', e);
    }
  })
}
