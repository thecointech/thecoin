import { promisify } from 'node:util';
import child_process from 'node:child_process';
import { log } from '@thecointech/logging';

const exec = promisify(child_process.exec);
const FIVE_MINS = 5 * 60 * 1000;

export async function enableLingeringForCurrentUser() {
  const user = process.env.USER; // Get the current username
  if (!user) {
    log.error('Could not determine current user.');
    // Handle error, inform user
    return {
      error: "Could not determine current user."
    };
  }

  // Command to enable lingering. This will likely prompt for sudo password.
  const command = `pkexec loginctl enable-linger ${user}`;
  const r = await exec(command, { timeout: FIVE_MINS });
  if (r.stderr) {
    let errorMessage = `Failed to enable background scheduling.`;
    if (r.stderr.includes('user not in the sudoers file')) {
      errorMessage += `\nReason: Your user account is not allowed to run 'sudo'. Please contact your system administrator.`;
    } else if (r.stderr.includes('sudo: a password is required')) {
      errorMessage += `\nReason: Incorrect password or operation cancelled. Please try again.`;
    } else {
      errorMessage += `\nDetails: ${r.stderr}`;
    }
    log.error(errorMessage);
    return {
      error: errorMessage,
    };
  }
  return {
    success: true,
  };
}
