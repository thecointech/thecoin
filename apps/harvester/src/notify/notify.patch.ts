import type { App, Shell } from 'electron';
import { readdirSync } from 'fs';
import path from 'path';
import { appID } from './notify';
import { log } from '@thecointech/logging';

// Fix SnoreToast.  Taken from https://github.com/mikaelbr/node-notifier/issues/424
// Depends on SnoreToast version https://github.com/KDE/snoretoast/blob/master/CMakeLists.txt#L5
const toastActivatorClsid = "eb1fdd5b-8f70-4b5a-b230-998a2dc19303"; // v0.7.0

//
// - IMPORTANT - This work to enable interactive toasts was made redunant by the implementation
//               of notifyInput.ts for explicit feedback.  Kept in anticipation of more general
//               toast support in the future.
//
export function fixToastButtonsOnWindows(app: App, shell: Shell) {
  log.info("Patching toast buttons on windows");

  app.setAppUserModelId(appID);

  const appLocation = process.execPath;
  const appData = app.getPath("appData");

  // continue if not in dev mode / running portable app
  if (process.env.NODE_ENV === 'production' && !appLocation.startsWith(path.join(appData, "..", "Local", "Temp"))) {
    const programsFolder = path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs");
    patchAppShortcuts(shell, programsFolder, path.basename(appLocation));
  }
}

// Find all shortcuts pointing at our exe and ensure they carry the
// AppUserModelId + ToastActivatorClsid required for interactive toasts.
// We match shortcuts by their target rather than their filename: Squirrel
// names shortcuts after the exe's ProductName metadata, which can change
// between releases (and did - see forge.config.mjs win32metadata).
export function patchAppShortcuts(shell: Shell, programsFolder: string, exeName: string) {
  const patched: string[] = [];
  for (const shortcutPath of findShortcutFiles(programsFolder)) {
    try {
      const shortcutDetails = shell.readShortcutLink(shortcutPath); // throws if not a valid shortcut
      if (path.basename(shortcutDetails.target).toLowerCase() !== exeName.toLowerCase()) continue;

      const cleanActivatorId = shortcutDetails.toastActivatorClsid
        ?.replace("{", "")
        .replace("}", "")
        .toLowerCase();
      if (
        shortcutDetails.appUserModelId !== appID ||
        cleanActivatorId !== toastActivatorClsid
      ) {
        log.info(`Patching shortcut: ${shortcutPath}`);
        shell.writeShortcutLink(
          shortcutPath,
          {
            ...shortcutDetails,
            appUserModelId: appID,
            toastActivatorClsid
          }
        );
        patched.push(shortcutPath);
      }
      else {
        log.info(`No update needed: ${shortcutPath}`);
      }
    } catch (error) {
      log.error(error, `Could not read/write shortcut: ${shortcutPath}`);
    }
  }
  if (patched.length === 0) {
    log.warn(`No shortcuts targeting ${exeName} needed patching in ${programsFolder}`);
  }
  return patched;
}

// All *.lnk files in the Programs folder and its immediate subfolders
// (Squirrel places shortcuts either in the root or a CompanyName subfolder)
function findShortcutFiles(programsFolder: string) {
  const folders = [programsFolder];
  try {
    folders.push(
      ...readdirSync(programsFolder, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => path.join(programsFolder, e.name))
    );
  } catch (error) {
    log.error(error, `Could not read Programs folder: ${programsFolder}`);
    return [];
  }
  return folders.flatMap(folder => {
    try {
      return readdirSync(folder)
        .filter(f => f.toLowerCase().endsWith('.lnk'))
        .map(f => path.join(folder, f));
    } catch {
      return [];
    }
  });
}
