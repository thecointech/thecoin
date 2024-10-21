// Find all files called "launch.json" in subfolders and update the jest config

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const rootDir = path.resolve(process.cwd(), "..");
const files = await glob('**/.vscode/launch.json', { cwd: rootDir, ignore: '**/node_modules/**' });

const testConfig = {
  "type": "node",
  "name": "vscode-jest-tests.v2",
  "request": "launch",
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}",
  "runtimeExecutable": "yarn",
  "args": [
    "test",
    "--runInBand",
    "--watchAll=false",
    "--testNamePattern",
    "${jest.testNamePattern}",
    "--runTestsByPath",
    "${jest.testFile}"
  ],
  "customDescriptionGenerator": "function (def) { if (this.toString) { const _v = this.toString(); if (_v.indexOf(\"[object Object]\") < 0) return _v; } return def; }"
}

for (const f of files) {
  const launchFile = path.join(rootDir, f);
  const launchRaw = readFileSync(launchFile, 'utf8');
  const launchJson = eval(`const g = ${launchRaw}; g`);

  const existing = launchJson.configurations.find(c => c.name === 'vscode-jest-tests.v2' || c.name === 'vscode-jest-tests');
  if (existing) {
    launchJson.configurations = launchJson.configurations.filter(c => c.name !== 'vscode-jest-tests.v2' && c.name !== 'vscode-jest-tests');
    launchJson.configurations.push(testConfig);
    writeFileSync(launchFile, JSON.stringify(launchJson, null, 2));
  }
}
