import { AsyncLocalStorage } from 'node:async_hooks';
import { LoggerContext } from './loggerContext';

export class NodeLoggerContext extends LoggerContext {
    private static asyncEntry = new AsyncLocalStorage<LoggerContext[]>();
    private static globalStack: LoggerContext[] = [];

    static {
        super.setStorage({
            getStack: () => this.asyncEntry.getStore() ?? this.globalStack,
            run: <T>(fn: () => T) => {
                const parentStack = this.asyncEntry.getStore() ?? [];
                return this.asyncEntry.run([...parentStack], fn);
            }
        });
    }
}
