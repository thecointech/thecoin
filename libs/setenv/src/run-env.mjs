#!/usr/bin/env node

import { getEnvVars } from "./vars.mjs";
import { spawn } from "child_process";
import { existsSync } from 'fs';
import { fileURLToPath } from "url";

function sliceArgs(args, name, def) {
  const arg = args.find(a => a.startsWith(`${name}=`));
  if (arg) {
    const v = arg.split("=")[1];
    args.splice(args.indexOf(arg), 1);
    return v;
  }
  return def;
}

let args = process.argv.slice(2);
const config = sliceArgs(args, "cfg", process.env.CONFIG_NAME ?? "development");
let executable = sliceArgs(args, "exec", "node");

// Now, run node with ncr
// TODO: Support ts-node?
const env = {
  ...process.env,
  ...getEnvVars(config),
}

// Always attach experimental loader
const registerTypescript = args.find(arg => arg.endsWith(".ts"))
env.NODE_OPTIONS=`${env.NODE_OPTIONS ?? ""} --loader=${
  new URL(
    registerTypescript
      ? "ncr_ts.mjs"
      : "ncr.mjs",
    import.meta.url
  )} --es-module-specifier-resolution=node`;
// if () {
//   // env.TS_NODE_PROJECT = fileURLToPath(new URL("../../../tsconfig.dev.json", import.meta.url));
//   args.unshift(ncr_path);
//   args.unshift("--loader");
//   // args.unshift("ts-node/esm");
//   // args.unshift("--loader");
//   // executable = "ts-node-esm";
//   // const node_options = args.filter(arg => arg.startsWith("--"));
//   // env.NODE_OPTIONS = `${env.NODE_OPTIONS} ${node_options.join(' ')}`;
//   // args = args.filter(arg => !node_options.includes(arg));
// }

// If this is yarn script?
if (executable != "node") {
  // Is this a command in .bin folder (ie - is it webpack?)
  const binUrl = new URL(`../../../node_modules/.bin/${executable}`, import.meta.url);
  if (existsSync(binUrl)) {
    executable = fileURLToPath(binUrl);
    if (process.platform == "win32") {
      // On windows we target the .cmd version
      executable = executable + ".cmd";
    }
  }
}

const proc = spawn(
  executable,
  args,
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
