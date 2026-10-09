// Test/diagnostic commands triggered from the command line.
// Kept out of index.ts so they are only loaded when requested.
import { app } from 'electron';
import { log } from '@thecointech/logging';
import { hasArgument } from './arguments';
import { notify, notifyInput } from './notify';

export async function runCli() {
  if (hasArgument("--notify")) {
    const icon = process.argv.find(op => op.includes("--icon"))?.split("=")[1];
    const r = await notify({
      title: "Test Title",
      message: "I am a message",
      icon: icon ?? "money.png",
      // actions: ["Click Me!"],
    })
    log.info("Notification result: ", r)
  }
  else if (hasArgument("--ask-input")) {
    const r = await notifyInput("Enter your 2FA code:");
    log.info("Test Result: ", r)
  }

  await new Promise(resolve => setTimeout(resolve, 100)); // Give logs time to flush
  app.quit();
  process.exit(0);
}
