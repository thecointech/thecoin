import { log } from '@thecointech/logging';
import notifier from 'node-notifier';
import type { Notification } from 'node-notifier';
import { fileURLToPath } from 'url';
import path from 'path';
import { DisplayContext } from './displayContext';
import type NotifySend from 'node-notifier/notifiers/notifysend';

export const appID = 'com.squirrel.harvester.harvester';


export const notifyError = (props: {
  title: string
  message: string
  // readonly actions?: T
}) => notify({
  ...props,
  // wait: true,
  icon: "icon_error.png",
}, true);

// NOTE TO FUTURE ME: Couldn't figure out how to type
// the return effectively.  Looks possible, but not
// important enough to figure out right now
export const notify = (props: Notification, isError?: boolean) : Promise<void> => {
  // Don't post a bazzilion of these things each test run
  if (process.env.RUNTIME_ENV === "test") {
    return Promise.resolve();
  }

  switch (process.platform) {
    case 'linux':
      return notify_linux(props, isError);
    default:
      return notify_default(props);
  }
}

function notify_default(props: Notification) : Promise<void> {
  return new Promise((resolve, reject) => {
    using _ = new DisplayContext();
    notifier.notify({
      ...props,
      icon: getAsset(props.icon),
      //@ts-ignore - The AppID is windows-only
      appID,
    }, (err, _response, _metadata) => {
      if (err) {
        log.error(err);
        return reject(err);
      }
      resolve();
    });
  })
}

function notify_linux(props: Notification, isError?: boolean) : Promise<void> {

  const appName = process.env.CONFIG_ENV === "prod"
    ? "TheCoin - Harvester"
    : `TheCoin - Harvester (${process.env.CONFIG_ENV})`;
  return new Promise((resolve, reject) => {
    using _ = new DisplayContext();
    notifier.notify({
      ...props,
      timeout: isError ? 15 : 5 * 60,
      icon: getAsset(props.icon),
      urgency: isError ? 'critical' : 'normal',
       'app-name': appName,
    } as NotifySend.Notification, (err, _response, _metadata) => {
      if (err) {
        log.error(err);
        return reject(err);
      }
      // Resolve immediately, linux doesn't support
      // actions/replies via this interface
      resolve();
    });
  })
}

export const getAsset = (assetName?: string) => {
  if (!assetName) return;
  return (process.env.NODE_ENV === 'development')
    ? fileURLToPath(new URL(`../../assets/${assetName}`, import.meta.url))
    : path.join(process.resourcesPath, 'assets', assetName);
}
