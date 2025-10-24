import type { createLogger as createNodeLogger, LogLevel, Serializers } from "bunyan";
import type { createLogger as createBrowserLogger, LogStream } from "browser-bunyan";

// Our unified logger type.  Is the minimal of set of functionality offered
type BaseLogger = ReturnType<typeof createNodeLogger> | ReturnType<typeof createBrowserLogger>;
// Overwrite the conflicting "child" type, type-safety is enforced i the loggerContext
export type BunyanLogger = Omit<BaseLogger, "child"> & {
  child: (options: any, simple?: boolean) => BunyanLogger
};

// LogStream from browser is more limited than stream from bunyan
type UniversalStream = {
  level?: LogLevel
} & LogStream;

// Read from bunyan src
type StreamFile = {
  type?: "file",
  path: string,
}
type StreamWrite = {
  type?: "stream",
} & LogStream;
// Also, rotating-file & raw, but I don't see us using them
type AnyStream = StreamFile|StreamWrite;

export type ChildOptions = {
  streams?: AnyStream[];
  level?: LogLevel;
  stream?: UniversalStream;
  serializers?: Serializers;
  src?: boolean;
  [custom: string]: any;
}
