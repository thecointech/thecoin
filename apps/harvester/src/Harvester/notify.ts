import { log } from '@thecointech/logging';
import notifier from 'node-notifier';
import { fileURLToPath } from 'url';
import path from 'path';

export const appID = 'com.squirrel.harvester.harvester';

export const notifyError = <T extends string[]>(props: {
  title: string
  message: string
  readonly actions?: T
}) => notify({
  ...props,
  wait: true,
  icon: "icon_error.png"
});

// NOTE TO FUTURE ME: Couldn't figure out how to type
// the return effectively.  Looks possible, but not
// important enough to figure out right now
export const notify = <T extends string[]>(props: {
  title: string
  message: string
  wait?: boolean
  icon?: string
  readonly actions?: T
}) => {
  // Don't post a bazzilion of these things each test run
  if (process.env.JEST_WORKER_ID) {
    return Promise.resolve('timeout');
  }

  return new Promise<T[number] | 'timeout'>((resolve, reject) => {
    notifier.notify({
      ...props,
      icon: getAsset(props.icon),
      //@ts-ignore - The AppID is windows-only
      appID,
      wait: props.wait,
      actions: props.actions,
    }, (err, _response, _metadata) => {
      if (err) {
        log.error(err);
        reject(err);
      }
      else if (!props.actions) {
        resolve('timeout');
      }
    });

    if (props.actions) {
      for (const action of props.actions || []) {
        notifier.on(action, () => {
          resolve(action);
        })
      }
      notifier.on('timeout', () => {
        resolve('timeout');
      });
    }
  })
}

export const getAsset = (assetName?: string) => {
  if (!assetName) return;
  return (process.env.NODE_ENV === 'development')
    ? fileURLToPath(new URL(`../../assets/${assetName}`, import.meta.url))
    : path.join(process.resourcesPath, 'assets', assetName);
}
