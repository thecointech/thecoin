import { BunyanLogger, ChildOptions } from './logger';

export interface IContextStorage {
  getStack(): LoggerContext[];
  run<T>(fn: () => T): T;
}

/**
 * LoggerContext provides a way to temporarily push a child logger context
 * that will be used by the proxied singleton logger.
 * Implements Disposable pattern for automatic cleanup.
 */
export class LoggerContext implements Disposable {
  protected static storage: IContextStorage;
  private static baseLogger: BunyanLogger;

  private childLogger: BunyanLogger;
  private isDisposed = false;

  /**
   * Set the base logger that will be used when no contexts are active
   */
  static setBaseLogger(logger: BunyanLogger): void {
    this.baseLogger = logger;
  }

  /**
   * Set the storage strategy for logger contexts (e.g. to use AsyncLocalStorage in Node)
   * Protected to ensure only subclasses can register their environment-specific storage.
   */
  protected static setStorage(newStorage: IContextStorage): void {
    LoggerContext.storage = newStorage;
  }

  /**
   * Get the currently active logger (top of context stack or base logger)
   */
  static getCurrentLogger(): BunyanLogger {
    const contextStack = LoggerContext.storage.getStack();
    return (
      contextStack.at(-1)?.getLogger() ??
      LoggerContext.baseLogger
    );
  }

  constructor(options: ChildOptions = {}, simple = false) {
    // Enforce simple is correct
    if (simple && (options.stream || options.streams)) {
      simple = false
    }
    // Use Bunyan's native child() method for proper context inheritance
    this.childLogger = LoggerContext.getCurrentLogger().child(options, simple);

    // Push this context onto the stack
    LoggerContext.storage.getStack().push(this);
  }

  /**
   * Run a function within a new context stack (isolated from other execution paths)
   */
  static run<T>(fn: () => T): T {
    if (!this.storage) return fn();
    return this.storage.run(fn);
  }

  /**
   * Get the child logger instance
   */
  getLogger(): BunyanLogger {
    return this.childLogger;
  }

  /**
   * Get the current context stack depth
   */
  static getStackDepth(): number {
    return LoggerContext.storage.getStack().length;
  }

  /**
   * Get all active contexts (for debugging)
   */
  static getActiveContexts(): LoggerContext[] {
    return [...LoggerContext.storage.getStack()];
  }

  private _dispose(): void {
    if (this.isDisposed) return;

    // Remove this context from the stack
    const contextStack = LoggerContext.storage.getStack();
    const index = contextStack.indexOf(this);
    if (index == -1) {
      LoggerContext.baseLogger.error("LoggerContext disposed but not found in the stack")
    }
    if (index !== -1) {
      contextStack?.splice(index, 1);
    }

    this.isDisposed = true;
  }

  /**
   * Dispose of the logger context
   */
  [Symbol.dispose](): void {
    this._dispose();
  }

  /**
   * Manual disposal method (for environments that don't support Symbol.dispose)
   */
  dispose(): void {
    this._dispose();
  }
}

/**
 * Create a logger proxy that delegates to the currently active logger
 */
export function createLoggerProxy(baseLogger: BunyanLogger): BunyanLogger {
  LoggerContext.setBaseLogger(baseLogger);

  return new Proxy(baseLogger, {
    get(target, prop) {
      const currentLogger = LoggerContext.getCurrentLogger();

      // For other methods/properties, delegate to current logger if it has them,
      // otherwise fall back to base logger
      if (prop in currentLogger) {
        const value = (currentLogger as any)[prop];
        return typeof value === 'function' ? value.bind(currentLogger) : value;
      }

      // Fallback to base logger
      const value = (target as any)[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  }) as BunyanLogger;
}
