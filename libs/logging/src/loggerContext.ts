import { BunyanLogger, ChildOptions } from './logger';


// Global context stack for tracking active logger contexts
const contextStack: LoggerContext[] = [];
let baseLogger: BunyanLogger | null = null;

/**
 * Set the base logger that will be used when no contexts are active
 */
export function setBaseLogger(logger: BunyanLogger): void {
  baseLogger = logger;
}

/**
 * Get the currently active logger (top of context stack or base logger)
 */
export function getCurrentLogger(): BunyanLogger {
  return contextStack[contextStack.length - 1]?.getLogger()
    ?? baseLogger!;
}

/**
 * LoggerContext provides a way to temporarily push a child logger context
 * that will be used by the proxied singleton logger.
 * Implements Disposable pattern for automatic cleanup.
 */
export class LoggerContext implements Disposable {
  private childLogger: BunyanLogger;
  private isDisposed = false;

  constructor(options: ChildOptions = {}, simple=false) {
    // Enforce simple is correct
    if (simple && (options.stream || options.streams)) {
      simple = false
    }
    // Use Bunyan's native child() method for proper context inheritance
    this.childLogger = getCurrentLogger().child(options, simple);

    // Push this context onto the stack
    contextStack.push(this);
  }

  /**
   * Get the child logger instance
   */
  getLogger(): BunyanLogger {
    return this.childLogger;
  }

  // addStream = (...args: Parameters<BunyanLogger["addStream"]>) => this.childLogger.addStream(...args)

  /**
   * Get the current context stack depth
   */
  static getStackDepth(): number {
    return contextStack.length;
  }

  /**
   * Get all active contexts (for debugging)
   */
  static getActiveContexts(): LoggerContext[] {
    return [...contextStack];
  }

  private _dispose(): void {
    if (this.isDisposed) return;

    // Remove this context from the stack
    const index = contextStack.indexOf(this);
    if (index == -1) {
      baseLogger?.error("LoggerContext disposed but not found in the stack")
    }
    if (index !== -1) {
      contextStack.splice(index, 1);
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
  setBaseLogger(baseLogger);

  return new Proxy(baseLogger, {
    get(target, prop) {
      const currentLogger = getCurrentLogger();

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
