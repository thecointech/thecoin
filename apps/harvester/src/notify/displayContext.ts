import { homedir } from "node:os";

/**
 * Disposable context that temporarily switches DISPLAY from Xvfb (:99) to real display
 * for user-facing notifications and dialogs on Linux.
 *
 * Uses TC_REAL_DISPLAY as fallback if DISPLAY is unset or pointing to Xvfb.
 */
export class DisplayContext implements Disposable {
  private originalDisplay: string | undefined;
  private setAuthority: boolean | undefined;

  constructor() {
    // On Linux, ensure DISPLAY points to real display for user-facing dialogs
    if (process.platform === 'linux') {
      const currentDisplay = getKey("DISPLAY");

      // If DISPLAY is unset or pointing to Xvfb, use TC_REAL_DISPLAY fallback
      if (!currentDisplay || currentDisplay === ':99') {
        const fallbackDisplay = getKey("TC_REAL_DISPLAY") || ':0';
        this.originalDisplay = currentDisplay;
        setKey("DISPLAY", fallbackDisplay);
      }
      // The security cookie.
      // NOTE: On some modern systems (like Ubuntu with GDM), this might be in /run/user/{uid}/gdm/Xauthority
      // But ~/.Xauthority is the standard fallback.
      const currentAuthority = getKey("XAUTHORITY");
      if (!currentAuthority) {
        this.setAuthority = true;
        setKey("XAUTHORITY", `${homedir()}/.Xauthority`);
      }
    }
  }

  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    // Restore original DISPLAY if we changed it
    if (this.originalDisplay !== undefined) {
      if (this.originalDisplay) {
        setKey("DISPLAY", this.originalDisplay);
      } else {
        delKey("DISPLAY");
      }
    }
    // Restore original XAUTHORITY if we changed it
    if (this.setAuthority) {
      delKey("XAUTHORITY");
    }
  }
}

const getKey = (key: string) => process.env[key];
const setKey = (key: string, value: string) => process.env[key] = value;
const delKey = (key: string) => delete process.env[key];
