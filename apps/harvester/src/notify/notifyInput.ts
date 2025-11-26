import { execSync } from "child_process";
import { log } from "@thecointech/logging";
import { DisplayContext } from "./displayContext";

/**
 * Ask for user input via platform-specific dialogs.
 * On Linux, uses zenity (requires DISPLAY to be set).
 * On macOS, uses osascript with text input dialog.
 * On Windows, uses PowerShell InputBox.
 *
 * @param prompt - The prompt message to show the user
 * @param timeoutSeconds - Timeout in seconds (default: 300 = 5 minutes)
 * @returns The user's input, or null if cancelled/timeout
 */
export async function notifyInput(prompt: string, timeoutSeconds: number = 300): Promise<string | null> {
  // Skip during tests unless explicitly enabled
  if (process.env.RUNTIME_ENV === "test" && !process.env.TEST_ASK_INPUT) {
    return Promise.resolve(null);
  }

  using _ = new DisplayContext();
  const platform = process.platform;

  try {
    let result: string;

    if (platform === 'linux') {
      result = execSync(
        `zenity --entry --title="Harvester" --text="${prompt.replace(/"/g, '\\"')}" --timeout=${timeoutSeconds}`,
        {
          encoding: 'utf8',
          timeout: timeoutSeconds * 1000
        }
      ).trim();
    }

    else if (platform === 'darwin') {
      // NOTE: Not tested
      // macOS: Use osascript to show text input dialog
      const script = `display dialog "${prompt.replace(/"/g, '\\"')}" default answer "" with title "Harvester" with icon note buttons {"Cancel", "OK"} default button "OK"`;
      const output = execSync(
        `osascript -e '${script.replace(/'/g, "'\\''")}'`,
        {
          encoding: 'utf8',
          timeout: timeoutSeconds * 1000
        }
      );
      // Output format: "button returned:OK, text returned:user_input"
      const match = output.match(/text returned:(.+)/);
      result = match ? match[1].trim() : '';
    }

    else if (platform === 'win32') {
      // Windows: Use PowerShell InputBox
      // NOTE: Not Tested
      const psScript = `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::InputBox('${prompt.replace(/'/g, "''")}', 'Harvester')`;
      result = execSync(
        `powershell -Command "${psScript.replace(/"/g, '\\"')}"`,
        {
          encoding: 'utf8',
          timeout: timeoutSeconds * 1000
        }
      ).trim();
    }
    else {
      log.error({ platform }, 'Unsupported platform for askForInput');
      return null;
    }

    // Empty string means user cancelled
    return result || null;
  } catch (err: any) {
    // User cancelled, timeout, or command not found
    if (err.status === 1 || err.killed) {
      log.info('User cancelled input or timeout reached');
      return null;
    }
    log.error(err, 'Failed to ask for user input');
    return null;
  }
}
