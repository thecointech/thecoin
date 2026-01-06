#!/usr/bin/env node

import { getEnvVars } from "../build/index.js";
import { spawn } from "child_process";
import { existsSync } from 'fs';
import { fileURLToPath } from "url";
import { readdir } from 'fs/promises';
import { dirname, resolve } from 'path';

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
let cwd = sliceArgs(args, "cwd", process.cwd());

console.log(`--- RUNNING ${config} ENV ---`)

// Now, run node with ncr
const findTsConfig = async () => {
  // Start from the directory of the current file
  let currentDir = resolve(".");

  while (true) {
    // Read all files in the current directory
    const files = await readdir(currentDir);
    const configs = files.filter(f => f.startsWith('tsconfig') && f.endsWith('.json'));

    if (configs.length > 0) {
      // Look for build config first
      const buildConfig = configs.find(f => f.includes('build') || f.includes('app'));
      // Return full path to the config file
      const configFile = buildConfig ?? configs[0];
      return resolve(currentDir, configFile);
    }

    // Move up one directory
    const parentDir = dirname(currentDir);
    // Check if we've reached the root
    if (parentDir === currentDir) {
      return null;
    }
    currentDir = parentDir;
  }
}

const TS_NODE_PROJECT = process.env.TS_NODE_PROJECT ?? await findTsConfig();
const { CONFIG_NAME, ...rest } = process.env;
const env = {
  NODE_NO_WARNINGS: 1,
  TS_NODE_PROJECT,
  ...getEnvVars(config),
  ...rest,
}

const nodeArgs = [];
if (args.find(arg => arg.endsWith('.ts'))) {
  // We have 3 kinds of scripts to run:
  // basic nodejs scripts (eg email-fake-deposit)
  //  - these can't use ts-node, as it keeps crashing
  // service scripts (eg rates-service)
  //  - these can only use ts-node due to experimental decorators
  // electron apps (eg harvester)
  //  - these can use raw nodejs, but cannot use experimental-transform-types

  const isService = TS_NODE_PROJECT?.includes("-service/");
  const isElectron = env.ELECTRON_DISABLE_SANDBOX || process.env.HARVESTER_DEBUG_LIVE;

  // only service uses ts-node
  if (isService) nodeArgs.push("--loader=ts-node/esm");
  // everybody uses our custom loader
  nodeArgs.push(`--loader=${new URL("ncr-ts.mjs", import.meta.url).href}`);
  // NOTE: -es-module-specifier-resolution is no longer supported by node,
  // but is required by ts-node to correctly resolve imports
  if (isService) nodeArgs.push("--es-module-specifier-resolution=node")
  if (!isElectron && !isService) {
    nodeArgs.push("--experimental-transform-types");
  }
}
else {
  nodeArgs.push(`--loader=${new URL("ncr-js.mjs", import.meta.url).href}`);
}

env.NODE_OPTIONS=`${env.NODE_OPTIONS ?? ""} ${nodeArgs.join(" ")}`;

// If this is yarn script?
if (executable != "node") {
  if (executable.includes("python")) {
    if (process.platform == "win32") {
      // On windows we target the .cmd version
      executable = executable.replaceAll("/", "\\");
    }
  }
  else {
    // Is this a command in .bin folder (ie - is it webpack?)
    const binFolder = new URL(`../../../node_modules/.bin`, import.meta.url);
    const binUrl = new URL(executable, binFolder);
    if (existsSync(binUrl)) {
      env.PATH = `${fileURLToPath(binFolder)}:${env.PATH}`
      if (process.platform == "win32") {
        // On windows we target the .cmd version
        executable = executable + ".cmd";
      }
    }
  }
}
// Electron doesn't support transform-types flag, but everyone else needs it.
// else if (!env.ELECTRON_DISABLE_SANDBOX && !process.env.HARVESTER_DEBUG_LIVE) {
//   env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ""} --experimental-transform-types`;
// }

const proc = spawn(
  executable,
  args,
  { stdio: 'inherit', shell: true, cwd: cwd, env }
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
