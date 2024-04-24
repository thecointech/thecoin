import type { App, Shell } from 'electron';
import path from 'path';
import { appID } from './notify';
import { log } from '@thecointech/logging';

// Fix SnoreToast.  Taken from https://github.com/mikaelbr/node-notifier/issues/424
export function fixToastButtonsOnWindows(app: App, shell: Shell) {
    // Depends on SnoreToast version https://github.com/KDE/snoretoast/blob/master/CMakeLists.txt#L5
    const toastActivatorClsid = "eb1fdd5b-8f70-4b5a-b230-998a2dc19303"; // v0.7.0
  
    log.info("Patching toast buttons on windows");

    app.setAppUserModelId(appID);
  
    const appLocation = process.execPath;
    const appData = app.getPath("appData");
  
    // continue if not in dev mode / running portable app
    if (process.env.NODE_ENV === 'production' && !appLocation.startsWith(path.join(appData, "..", "Local", "Temp"))) {

      // shortcutPath can be anywhere inside AppData\Roaming\Microsoft\Windows\Start Menu\Programs\
      const shortcutPath = path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Stephen Taylor", "harvester.lnk");
      // check if shortcut doesn't exist -> create it, if it exist and invalid -> update it
      try { 
        log.info("searching for shortcut");
        const shortcutDetails = shell.readShortcutLink(shortcutPath); // throws error if it doesn't exist yet
        const cleanActivatorId = shortcutDetails.toastActivatorClsid
          ?.replace("{", "")
          .replace("}", "")
          .toLowerCase();
        if (
          shortcutDetails.appUserModelId !== appID ||
          cleanActivatorId !== toastActivatorClsid
        ) {
          log.info('Patching shortcut: ');
          shell.writeShortcutLink(
            shortcutPath,
            {
              ...shortcutDetails,
              appUserModelId: appID,
              toastActivatorClsid
            }
          );
        }
        else {
          log.info('No update needed');
        }
      } catch (error) {
        // This should never happen
        log.error(error, "Shortcut not found or invalid");
      }
    }
  }