import type { TaskProgress, BackgroundTaskCallback } from "@/BackgroundTask";
import { randomBytes } from "crypto";
import type { Server } from "http";

// Current in-flight server so we can support cancel
type ProgressCallback = (progress: TaskProgress) => void;
export type ConnectService = {
  cb: ProgressCallback,
  state: string,
  server?: Server,
  resolve?: ((v: boolean) => void),
  reject?: ((e: Error) => void),
  timeout?: NodeJS.Timeout,
};

declare global {
  var ConnectService: ConnectService|null;
}
globalThis.ConnectService = null;

export function startService(callback: BackgroundTaskCallback) {
  const state = randomBytes(24).toString('base64url');
  globalThis.ConnectService = {
    state,
    cb: (progress: TaskProgress) => {
      callback?.({
        id: state,
        type: "connect",
        description: "Connecting to your wallet",
        ...progress,
      })
    },
  }
  // Send 0 progres to indicate we've started.
  globalThis.ConnectService.cb({ percent: 0 })
  return globalThis.ConnectService;
}


export async function resetService(progress?: TaskProgress): Promise<boolean> {
  const service = globalThis.ConnectService;
  if (!service) return false;
  if (progress) {
    service.cb(progress);
  }
  if (service.timeout) {
    clearTimeout(service.timeout);
  }
  if (service.server) {
    try { service.server.close(); } catch {}
  }
  // if (currentServer.reject) {
  //   currentServer.reject(new Error('Cancelled'));
  // }
  globalThis.ConnectService = null;
  return true;
}
