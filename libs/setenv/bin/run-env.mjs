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
      const buildConfig = configs.find(f => f.includes('build'));
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
const env = {
  NODE_NO_WARNINGS: 1,
  TS_NODE_PROJECT,
  ...getEnvVars(config),
  ...process.env,
}

const loader = args.find(arg => arg.endsWith('.ts'))
  ? new URL("ncr-ts.mjs", import.meta.url)
  : new URL("ncr-js.mjs", import.meta.url);
// const loader = new URL("ncr-ts.mjs", import.meta.url)

// Always attach experimental loader
// NOTE: -es-module-specifier-resolution is no longer supported by node,
// but is required by ts-node to correctly resolve imports
env.NODE_OPTIONS=`${env.NODE_OPTIONS ?? ""} --loader=${loader} --es-module-specifier-resolution=node`;

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

const proc = spawn(
  executable,
  args,
  { stdio: 'inherit', shell: true, cwd: process.cwd(), env }
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
