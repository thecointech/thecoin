
// Duplicate the electron IPC class here
// Unfortunately electron can't be hoisted, so we
// don't have access to its definitions in libraries
// where we might need it
interface IpcMainInvokeEvent {

  // Docs: https://electronjs.org/docs/api/structures/ipc-main-invoke-event

  /**
   * The ID of the renderer frame that sent this message
   */
  frameId: number;
  /**
   * The internal ID of the renderer process that sent this message
   */
  processId: number;
  /**
   * Returns the `webContents` that sent the message
   */
  sender: any;
  /**
   * The frame that sent this message
   *
   */
  readonly senderFrame: any;
}
export interface IpcMain {
   /**
     * Adds a handler for an `invoke`able IPC. This handler will be called whenever a
     * renderer calls `ipcRenderer.invoke(channel, ...args)`.
     *
     * If `listener` returns a Promise, the eventual result of the promise will be
     * returned as a reply to the remote caller. Otherwise, the return value of the
     * listener will be used as the value of the reply.
     *
     * The `event` that is passed as the first argument to the handler is the same as
     * that passed to a regular event listener. It includes information about which
     * WebContents is the source of the invoke request.
     *
     * Errors thrown through `handle` in the main process are not transparent as they
     * are serialized and only the `message` property from the original error is
     * provided to the renderer process. Please refer to #24427 for details.
     */
    handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void;

}

//////////////////////////////////////////////////////////////////

export interface IpcRenderer {

  // Docs: https://electronjs.org/docs/api/ipc-renderer

  /**
   * Resolves with the response from the main process.
   *
   * Send a message to the main process via `channel` and expect a result
   * asynchronously. Arguments will be serialized with the Structured Clone
   * Algorithm, just like `window.postMessage`, so prototype chains will not be
   * included. Sending Functions, Promises, Symbols, WeakMaps, or WeakSets will throw
   * an exception.
   *
   * > **NOTE:** Sending non-standard JavaScript types such as DOM objects or special
   * Electron objects will throw an exception.
   *
   * Since the main process does not have support for DOM objects such as
   * `ImageBitmap`, `File`, `DOMMatrix` and so on, such objects cannot be sent over
   * Electron's IPC to the main process, as the main process would have no way to
   * decode them. Attempting to send such objects over IPC will result in an error.
   *
   * The main process should listen for `channel` with `ipcMain.handle()`.
   *
   * For example:
   *
   * If you need to transfer a `MessagePort` to the main process, use
   * `ipcRenderer.postMessage`.
   *
   * If you do not need a response to the message, consider using `ipcRenderer.send`.
   */
  invoke(channel: string, ...args: any[]): Promise<any>;
}
