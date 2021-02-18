// Temp file to ignore missing types in 3id-connect
// package while we wait for the next version to be released
declare module 'postmsg-rpc' {
  export function caller<A extends Array<unknown>, R>(
    funcName: string,
    opts: any
  ): (...args: A) => Promise<R>
  export function expose<T extends (...args: Array<any>) => any | Promise<any>>(
    funcName: string,
    func: T,
    opts: any
  ): { close: () => void }
}

declare module 'store';
declare module 'url-parse';
