import { spawn } from "child_process";
import path from "path";

export function verify(network: string, name: string, address: string) {
  const config = process.env.CONFIG_NAME;
  if (!config) {
    throw new Error("Cannot verify contract in development env");
  }

  const trufflecfg = path.join(__dirname, '..', 'src', 'truffle.cjs');
  return spawn(path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'truffle'),
    [
        `run verify ${name}@${address}`,
        ` --config=${trufflecfg}`,
        `--network ${network}`
    ],
    { stdio: 'inherit', shell: true, cwd: process.cwd() }
  );
}

