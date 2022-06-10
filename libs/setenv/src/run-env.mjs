#!/usr/bin/env node

import { getEnvVars } from "./vars.mjs";
import { spawn } from "child_process";

function sliceArgs(args, name, def) {
  const arg = args.find(a => a.startsWith(`${name}=`));
  if (arg) {
    const v = arg.split("=")[1];
    args.splice(args.indexOf(arg), 1);
    return v;
  }
  return def;
}

const args = process.argv.slice(2);
const config = sliceArgs(args, "cfg", process.env.CONFIG_NAME ?? "development");
const executable = sliceArgs(args, "exec", "node");

console.log("Running Config: " + config);

// Now, run node with ncr
// TODO: Support ts-node?
const ncr_path = new URL("ncr.mjs", import.meta.url);

const env = {
  ...process.env,
  ...getEnvVars(config),
}
const proc = spawn(
  executable,
  [
    `--experimental-loader=${ncr_path.toString()}`,
    ...args,
  ],
  { stdio: 'inherit', cwd: process.cwd(), env }
)

// Liberally inspired by cross-env: https://github.com/kentcdodds/cross-env/blob/master/src/index.js
process.on('SIGTERM', () => proc.kill('SIGTERM'))
process.on('SIGINT', () => proc.kill('SIGINT'))
process.on('SIGBREAK', () => proc.kill('SIGBREAK'))
process.on('SIGHUP', () => proc.kill('SIGHUP'))
proc.on('exit', (code, signal) => {
  let exitCode = code
  // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
  // but if the signal is SIGINT the user exited the process so we want exit code 0
  if (exitCode === null) {
    exitCode = signal === 'SIGINT' ? 0 : 1
  }
  process.exit(exitCode) //eslint-disable-line no-process-exit
})
